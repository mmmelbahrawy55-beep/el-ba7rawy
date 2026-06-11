import { db as firestore } from './server/firebase-admin';
import { categories as fallbackCategories, products as fallbackProducts } from '@/lib/products-data';

// Check for Firebase environment variables proactively
const isFirebaseConfigured = !!(
  process.env.FIREBASE_PROJECT_ID || 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

if (!isFirebaseConfigured && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: Firebase environment variables are missing!");
}

// Helper to convert Firestore docs to Prisma-like objects
const docToData = (doc: any) => {
  if (!doc || !doc.exists) return null;
  const data = doc.data();
  if (!data) return { id: doc.id };
  // Convert Firestore Timestamps to Dates
  for (const key in data) {
    if (data[key]?.toDate && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate();
    }
  }
  return { id: doc.id, ...data };
};

class FirestoreCollection {
  constructor(private collectionName: string) {}

  private get collection() {
    if (!firestore || typeof firestore.collection !== 'function') {
      console.warn("Firestore not initialized, using fallback data for", this.collectionName);
      return null;
    }
    return firestore.collection(this.collectionName);
  }

  async findMany(args: any = {}) {
    try {
      // Fallback logic if Firebase fails
      const useFallback = !this.collection;
      
      if (useFallback) {
        console.warn(`Using fallback data for ${this.collectionName}`);
        if (this.collectionName === 'Category') {
          return fallbackCategories.map(cat => ({
            ...cat,
            id: cat.id,
            isActive: cat.isActive ?? true
          }));
        }
        if (this.collectionName === 'Product') {
          return fallbackProducts.map(p => ({
            ...p,
            id: p.id,
            price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
            isAvailable: p.isActive ?? true
          }));
        }
        return [];
      }

      let ref: any = this.collection;
      let clientSideFilter: ((item: any) => boolean) | null = null;

      // Simple where clause handling (Prisma where: { key: value })
      if (args.where) {
        const entries = Object.entries(args.where);
        for (const [key, value] of entries) {
          if (value === undefined) continue;

          if (key === 'OR' && Array.isArray(value)) {
            // Firestore doesn't support OR natively for different fields easily
            // We'll fetch all and filter in memory if OR is used
            clientSideFilter = (item) => {
              return value.some((condition: any) => {
                const condEntries = Object.entries(condition);
                return condEntries.every(([cKey, cValue]: [string, any]) => {
                  if (cValue?.contains && item[cKey]) {
                    return item[cKey].toString().toLowerCase().includes(cValue.contains.toLowerCase());
                  }
                  return item[cKey] === cValue;
                });
              });
            };
          } else if (typeof value === 'object' && value !== null) {
            const valObj = value as any;
            if (valObj.contains) {
              // Handle contains via client-side filter
              const search = valObj.contains.toLowerCase();
              const oldFilter = clientSideFilter;
              clientSideFilter = (item) => {
                const match = item[key]?.toString().toLowerCase().includes(search);
                return oldFilter ? oldFilter(item) && match : match;
              };
            } else if (valObj.in && Array.isArray(valObj.in)) {
              ref = ref.where(key, 'in', valObj.in);
            }
          } else {
            ref = ref.where(key, '==', value);
          }
        }
      }

      // OrderBy handling
      if (args.orderBy) {
        const orderByArr = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        for (const orderBy of orderByArr) {
          const entries = Object.entries(orderBy);
          for (const [key, direction] of entries) {
            ref = ref.orderBy(key, direction === 'desc' ? 'desc' : 'asc');
          }
        }
      }

      // Limit handling
      if (args.take && !clientSideFilter) {
        ref = ref.limit(args.take);
      }

      const snapshot = await ref.get();
      let results = snapshot.docs.map(docToData);

      // Apply client-side filter if needed
      if (clientSideFilter) {
        results = results.filter(clientSideFilter);
        if (args.take) {
          results = results.slice(0, args.take);
        }
      }

      // Handle Includes
      if (args.include && results.length > 0) {
        for (const [relation, includeVal] of Object.entries(args.include)) {
          // Special handling for products relation in Category
          if (this.collectionName === 'Category' && relation === 'products') {
            for (const item of results) {
              const productsSnapshot = await firestore.collection('Product').where('categoryId', '==', item.id).get();
              item.products = productsSnapshot.docs.map(docToData);
              item._count = { products: item.products.length };
            }
          }
          else if (relation === 'category' || relation === 'parentCategory') {
            for (const item of results) {
              const foreignId = item[`${relation}Id`];
              if (foreignId) {
                const relDoc = await firestore.collection(relation === 'category' ? 'Category' : 'Category').doc(foreignId).get();
                item[relation] = docToData(relDoc);
              }
            }
          }
          // Handle _count
          else if (relation === '_count') {
            for (const item of results) {
              const productsSnapshot = await firestore.collection('Product').where('categoryId', '==', item.id).get();
              item._count = { products: productsSnapshot.size };
            }
          }
        }
      }

      // Handle select (simple mapping)
      if (args.select && results.length > 0) {
        results = results.map(item => {
          const newItem: any = {};
          for (const key in args.select) {
            if (args.select[key]) {
              newItem[key] = item[key];
            }
          }
          return newItem;
        });
      }

      return results;
    } catch (error) {
      console.error(`Firestore findMany error (${this.collectionName}):`, error);
      // Fallback to static data if Firebase fails
      if (this.collectionName === 'Category') {
        return fallbackCategories.map(cat => ({
          ...cat,
          id: cat.id,
          isActive: cat.isActive ?? true,
          products: cat.products,
          _count: { products: cat.products.length }
        }));
      }
      if (this.collectionName === 'Product') {
        return fallbackProducts.map(p => ({
          ...p,
          id: p.id,
          price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
          isAvailable: p.isActive ?? true
        }));
      }
      return [];
    }
  }

  async findUnique(args: any) {
    try {
      const useFallback = !this.collection;
      
      if (useFallback) {
        if (this.collectionName === 'Category') {
          const cat = fallbackCategories.find(c => c.id === args.where?.id);
          return cat ? { ...cat, id: cat.id, isActive: cat.isActive ?? true } : null;
        }
        if (this.collectionName === 'Product') {
          const prod = fallbackProducts.find(p => p.id === args.where?.id);
          return prod ? {
            ...prod,
            id: prod.id,
            price: prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0,
            isAvailable: prod.isActive ?? true
          } : null;
        }
        return null;
      }

      if (args.where?.id) {
        const doc = await this.collection.doc(args.where.id).get();
        return docToData(doc);
      }
      
      // Handle unique fields like email
      const entries = Object.entries(args.where || {});
      if (entries.length > 0) {
        const [key, value] = entries[0];
        const snapshot = await this.collection.where(key, '==', value).limit(1).get();
        
        if (snapshot.empty) return null;
        return docToData(snapshot.docs[0]);
      }
      
      return null;
    } catch (error) {
      console.error(`Firestore findUnique error (${this.collectionName}):`, error);
      // Fallback to static data if Firebase fails
      if (this.collectionName === 'Category') {
        const cat = fallbackCategories.find(c => c.id === args.where?.id);
        return cat ? { ...cat, id: cat.id, isActive: cat.isActive ?? true } : null;
      }
      if (this.collectionName === 'Product') {
        const prod = fallbackProducts.find(p => p.id === args.where?.id);
        return prod ? {
          ...prod,
          id: prod.id,
          price: prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0,
          isAvailable: prod.isActive ?? true
        } : null;
      }
      return null;
    }
  }

  async findFirst(args: any = {}) {
    const results = await this.findMany({ ...args, take: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async create(args: any) {
    try {
      if (!this.collection) {
        console.warn("Firebase not available, could not create item");
        // Return dummy data
        return { id: `temp-${Date.now()}`, ...args.data };
      }
      
      const data = {
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // If ID is provided in data, use it
      if (data.id) {
        const id = data.id;
        delete data.id;
        await this.collection.doc(id).set(data);
        return { id, ...data };
      }

      const docRef = await this.collection.add(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Firestore create error (${this.collectionName}):`, error);
      // Return dummy data to prevent crash
      return { id: `temp-${Date.now()}`, ...args.data };
    }
  }

  async update(args: any) {
    try {
      if (!this.collection) {
        console.warn("Firebase not available, could not update item");
        return { id: args.where.id, ...args.data };
      }
      
      const data = {
        ...args.data,
        updatedAt: new Date(),
      };
      const id = args.where.id;
      await this.collection.doc(id).update(data);
      const updatedDoc = await this.collection.doc(id).get();
      return docToData(updatedDoc);
    } catch (error) {
      console.error(`Firestore update error (${this.collectionName}):`, error);
      return { id: args.where.id, ...args.data };
    }
  }

  async delete(args: any) {
    try {
      if (!this.collection) {
        console.warn("Firebase not available, could not delete item");
        return args.where;
      }
      
      const id = args.where.id;
        const doc = await this.collection.doc(id).get();
        const data = docToData(doc);
        await this.collection.doc(id).delete();
        return data;
    } catch (error) {
      console.error(`Firestore delete error (${this.collectionName}):`, error);
        return args.where;
    }
  }

  async deleteMany(args: any = {}) {
    try {
      if (!this.collection) {
        console.warn("Firebase not available, could not delete items");
        return { count: 0 };
      }
      
      const snapshot = await this.collection.get();
      if (snapshot.empty) return { count: 0 };
      
      const batch = firestore.batch();
        snapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
        await batch.commit();
        return { count: snapshot.size };
    } catch (error) {
      console.error(`Firestore deleteMany error (${this.collectionName}):`, error);
        return { count: 0 };
    }
  }

  async upsert(args: any) {
    try {
      const existing = await this.findUnique({ where: args.where });
      if (existing) {
        return await this.update({ where: args.where, data: args.update });
      } else {
        return await this.create({ data: { ...args.where, ...args.create } });
      }
    } catch (error) {
      console.error(`Firestore upsert error (${this.collectionName}):`, error);
        throw error;
    }
  }

  async count(args: any = {}) {
    try {
      if (!this.collection) {
        console.warn("Firebase not available, counting fallback data");
        if (this.collectionName === 'Category') return fallbackCategories.length;
        if (this.collectionName === 'Product') return fallbackProducts.length;
        return 0;
      }
      
      let ref: any = this.collection;
        if (args.where) {
          for (const [key, value] of Object.entries(args.where)) {
            if (value !== undefined && typeof value !== 'object') {
              ref = ref.where(key, '==', value);
            }
          }
        }
        const snapshot = await ref.count().get();
        return snapshot.data().count;
    } catch (error) {
      console.error(`Firestore count error (${this.collectionName}):`, error);
        if (this.collectionName === 'Category') return fallbackCategories.length;
        if (this.collectionName === 'Product') return fallbackProducts.length;
        return 0;
    }
  }
}

// Map Prisma model names to Firestore collection names
export const db = {
  user: new FirestoreCollection('User'),
  setting: new FirestoreCollection('Setting'),
  category: new FirestoreCollection('Category'),
  product: new FirestoreCollection('Product'),
  order: new FirestoreCollection('Order'),
  project: new FirestoreCollection('Project'),
  activityLog: new FirestoreCollection('ActivityLog'),
  partner: new FirestoreCollection('Partner'),
  message: new FirestoreCollection('Message'),
  client: new FirestoreCollection('Client'),
  socialAccount: new FirestoreCollection('SocialAccount'),
  socialLinkingLog: new FirestoreCollection('SocialLinkingLog'),
  marketingPost: new FirestoreCollection('MarketingPost'),
  marketingAIConfig: new FirestoreCollection('MarketingAIConfig'),
  marketingAnalytics: new FirestoreCollection('MarketingAnalytics'),
  testimonial: new FirestoreCollection('Testimonial'),
  faq: new FirestoreCollection('FAQ'),
  supplier: new FirestoreCollection('Supplier'),
  transaction: new FirestoreCollection('Transaction'),
  supplierTransaction: new FirestoreCollection('SupplierTransaction'),
};