import { db as firestore } from './server/firebase-admin';

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
  if (!doc.exists) return null;
  const data = doc.data();
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

  async findMany(args: any = {}) {
    try {
      let ref: any = firestore.collection(this.collectionName);
      let clientSideFilter: ((item: any) => boolean) | null = null;

      // Simple where clause handling (Prisma where: { key: value })
      if (args.where) {
        const filters = Object.entries(args.where);
        for (const [key, value] of filters) {
          if (value === undefined) continue;

          if (key === 'OR' && Array.isArray(value)) {
            // Firestore doesn't support OR natively for different fields easily
            // We'll fetch all and filter in memory if OR is used
            clientSideFilter = (item) => {
              return value.some((condition: any) => {
                return Object.entries(condition).every(([cKey, cValue]: [string, any]) => {
                  if (cValue?.contains) {
                    const search = cValue.contains.toLowerCase();
                    return item[cKey]?.toLowerCase().includes(search);
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
                const match = item[key]?.toLowerCase().includes(search);
                return oldFilter ? oldFilter(item) && match : match;
              };
            } else if (valObj.in) {
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
          for (const [key, direction] of Object.entries(orderBy)) {
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

      // Handle Prisma "include" (manual join because Firestore doesn't support joins)
      if (args.include && results.length > 0) {
        for (const [relation, includeVal] of Object.entries(args.include)) {
          if (includeVal) {
            // Very basic implementation for specific relations
            // In a real scenario, this would need to be more robust
            if (relation === 'category' || relation === 'parentCategory') {
              for (const item of results) {
                const foreignId = item[`${relation}Id` as keyof typeof item];
                if (foreignId) {
                  const relDoc = await firestore.collection(relation === 'category' ? 'Category' : 'Category').doc(foreignId).get();
                  item[relation] = docToData(relDoc);
                }
              }
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error(`Firestore findMany error (${this.collectionName}):`, error);
      return [];
    }
  }

  async findUnique(args: any) {
    try {
      if (args.where.id) {
        const doc = await firestore.collection(this.collectionName).doc(args.where.id).get();
        return docToData(doc);
      }
      // Handle unique fields like email
      const snapshot = await firestore.collection(this.collectionName)
        .where(Object.keys(args.where)[0], '==', Object.values(args.where)[0])
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return docToData(snapshot.docs[0]);
    } catch (error) {
      console.error(`Firestore findUnique error (${this.collectionName}):`, error);
      return null;
    }
  }

  async findFirst(args: any) {
    const results = await this.findMany({ ...args, take: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async create(args: any) {
    try {
      const data = {
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // If ID is provided in data, use it
      if (data.id) {
        const id = data.id;
        delete data.id;
        await firestore.collection(this.collectionName).doc(id).set(data);
        return { id, ...data };
      }

      const docRef = await firestore.collection(this.collectionName).add(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Firestore create error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async update(args: any) {
    try {
      const data = {
        ...args.data,
        updatedAt: new Date(),
      };
      const id = args.where.id;
      await firestore.collection(this.collectionName).doc(id).update(data);
      const updatedDoc = await firestore.collection(this.collectionName).doc(id).get();
      return docToData(updatedDoc);
    } catch (error) {
      console.error(`Firestore update error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async delete(args: any) {
    try {
      const id = args.where.id;
      const doc = await firestore.collection(this.collectionName).doc(id).get();
      const data = docToData(doc);
      await firestore.collection(this.collectionName).doc(id).delete();
      return data;
    } catch (error) {
      console.error(`Firestore delete error (${this.collectionName}):`, error);
      throw error;
    }
  }

  async deleteMany(args: any = {}) {
    try {
      const snapshot = await firestore.collection(this.collectionName).get();
      if (snapshot.empty) return { count: 0 };
      
      const batch = firestore.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
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
      let ref: any = firestore.collection(this.collectionName);
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
