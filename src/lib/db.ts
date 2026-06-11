import { db as firestore } from './server/firebase-admin';

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
      throw new Error(`CRITICAL: Firestore is not initialized! Check your Environment Variables and Private Key.`);
    }
    return firestore.collection(this.collectionName);
  }

  async findMany(args: any = {}) {
    try {
      let ref: any = this.collection;
      let clientSideFilter: ((item: any) => boolean) | null = null;

      if (args.where) {
        const entries = Object.entries(args.where);
        for (const [key, value] of entries) {
          if (value === undefined) continue;
          if (key === 'OR' && Array.isArray(value)) {
            clientSideFilter = (item) => value.some((condition: any) => 
              Object.entries(condition).every(([cKey, cValue]: [string, any]) => 
                cValue?.contains ? item[cKey]?.toString().toLowerCase().includes(cValue.contains.toLowerCase()) : item[cKey] === cValue
              )
            );
          } else if (typeof value === 'object' && value !== null) {
            const valObj = value as any;
            if (valObj.contains) {
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

      if (args.orderBy) {
        const orderByArr = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        for (const orderBy of orderByArr) {
          for (const [key, direction] of Object.entries(orderBy)) {
            ref = ref.orderBy(key, direction === 'desc' ? 'desc' : 'asc');
          }
        }
      }

      if (args.take && !clientSideFilter) ref = ref.limit(args.take);

      const snapshot = await ref.get();
      let results = snapshot.docs.map(docToData);

      if (clientSideFilter) {
        results = results.filter(clientSideFilter);
        if (args.take) results = results.slice(0, args.take);
      }

      // Handle Includes
      if (args.include && results.length > 0) {
        for (const [relation, includeVal] of Object.entries(args.include)) {
          if (this.collectionName === 'Category' && relation === 'products') {
            for (const item of results) {
              const productsSnapshot = await firestore.collection('Product').where('categoryId', '==', item.id).get();
              item.products = productsSnapshot.docs.map(docToData);
              item._count = { products: item.products.length };
            }
          } else if (relation === 'category' || relation === 'parentCategory') {
            for (const item of results) {
              const foreignId = item[`${relation}Id` as keyof typeof item];
              if (foreignId) {
                const relDoc = await firestore.collection(relation === 'category' ? 'Category' : 'Category').doc(foreignId).get();
                item[relation] = docToData(relDoc);
              }
            }
          } else if (relation === '_count') {
            for (const item of results) {
              const productsSnapshot = await firestore.collection('Product').where('categoryId', '==', item.id).get();
              item._count = { products: productsSnapshot.size };
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error(`Firestore findMany error (${this.collectionName}):`, error);
      throw error; // Throw error to see it in logs/UI
    }
  }

  async findUnique(args: any) {
    try {
      if (args.where?.id) {
        const doc = await this.collection.doc(args.where.id).get();
        return docToData(doc);
      }
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
      throw error;
    }
  }

  async findFirst(args: any = {}) {
    const results = await this.findMany({ ...args, take: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async create(args: any) {
    try {
      const data = { ...args.data, createdAt: new Date(), updatedAt: new Date() };
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
      throw error;
    }
  }

  async update(args: any) {
    try {
      const data = { ...args.data, updatedAt: new Date() };
      const id = args.where.id;
      await this.collection.doc(id).update(data);
      const updatedDoc = await this.collection.doc(id).get();
      return docToData(updatedDoc);
    } catch (error) {
      console.error(`Firestore update error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async delete(args: any) {
    try {
      const id = args.where.id;
      const doc = await this.collection.doc(id).get();
      const data = docToData(doc);
      await this.collection.doc(id).delete();
      return data;
    } catch (error) {
      console.error(`Firestore delete error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async deleteMany(args: any = {}) {
    try {
      const snapshot = await this.collection.get();
      if (snapshot.empty) return { count: 0 };
      const batch = firestore.batch();
      snapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      await batch.commit();
      return { count: snapshot.size };
    } catch (error) {
      console.error(`Firestore deleteMany error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async upsert(args: any) {
    const existing = await this.findUnique({ where: args.where });
    if (existing) return await this.update({ where: args.where, data: args.update });
    return await this.create({ data: { ...args.where, ...args.create } });
  }

  async count(args: any = {}) {
    try {
      let ref: any = this.collection;
      if (args.where) {
        for (const [key, value] of Object.entries(args.where)) {
          if (value !== undefined && typeof value !== 'object') ref = ref.where(key, '==', value);
        }
      }
      const snapshot = await ref.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error(`Firestore count error (${this.collectionName}):`, error);
      throw error;
    }
  }
}

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
