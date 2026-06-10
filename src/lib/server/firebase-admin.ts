// Check if we are on the server side
let db: any;
let auth: any;
let storage: any;

if (typeof window === 'undefined') {
  const admin = require('firebase-admin');
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "elba7rawy-49a39",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@elba7rawy-49a39.iam.gserviceaccount.com",
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDwZusqr9Xd2LvX\nmIcUR6dbNI7KVp5aVIq5/vva4jv7ZvcPYqP4PcaZviD7B7diJR5jPK27b4leuje2\nrdk6vw1tJH0nyrbX0XUJwOZsEeQyVTizD+yJDYnWlF9+unRYBg7Mc3vSI3T/ufWJ\nfKoyxnmrZ0BpP6YT/copf9ZB9u9uHm+jv85E+397WBXHQM3w3E9qtWoC9BGEdEEU\nv3GZLz9yS0KRa2HwHJoLiFwLKnsZ+NDG+TKssHRjOX8ywXuqs3NuEUR42EQwSQ4f\nMMBBjOAgmjvPznUvq6+VrRTPBpQ+ueg+ENwxHJPz6H58n/Vm5JIR8iYGN+c2qiZ8\nQQXfMLVdAgMBAAECggEAMXNqQoCjBJx1n1avypsmsNsx2CtTLY+gbbwmwJKy9fbr\nMU4AHqtOdAepLxoaPeUWyCEON7Us08CIf1ppie0M7PuJhyrqy6A5bAUzIN3ZTAU9\nwY+v/006oloo/p+KGSU93A6RVNuYUJZHDL4JIKK1Gm4F0OCX4BrfgAPc5frOq57P\nD580J3dplrXfWO4ZwyjOHra30rZUamjVn3Fg3OWjd0S/kWQaJ45Ndmjs1cNB8Rb1\nXNopU0iClCgkNLa16789pCXg/5/nY/117U0odPOM6L3rc1iBtVPRoOOQK0L5QOmf\nr22ly6fro+UNse4rEagQgm4y/aNtvJwxwutnuV6XQQKBgQD90PAPC65EGFvwm+Lp\nARH+087cp8JmLu0kkLV3ftJO2MO845mJWuEczUEl28htU0JUVuFbK76agGi2McuH\nxpwjJDiQNqNKFF5oQe9siXLNM2AycmfKhTG8EpuXT4nWAelzdCRgUGv+bOEe4tOs\nCcnvt6u3te8A/x2TXHLr5/yV8QKBgQDyeG8+4PhKQNUtYG83/h3iFB8mdkBdZ8Wp\nrgtM6WrGxGduxld3UwG0CLNt40VFY/MJHfjFdH2ZTvK7WljIL+A3mDAmHHntooSx\nn5gTlsF9W7sf9SEk9nGxCN20SV0sJuvnaNeXSwS4xpyyeNp9qiSGUIA/G7t515OY\nBXtyMi36LQKBgAK3AmpWyKVn0UvwjuvJHCUqpNLNZJHtPJIgjiBaFevL+8QAdzr1\n4uSI+YJrKGiq9FGsoDp2bFKAvx37yF6KbE8f6w731qVLNHtPAT2a9sRlIUlI2f1b\nkV2eoVVr/2BvosyeWGlDUvRku7+102fKrwNGZqrPYmATWoCiA4SsdZIxAoGACfWw\nfCC5kjM/jnGbn+0sRREWhnntAuk0UVf41tvvquJ+bSpwhVI/i6mf1S+0tLj6TrGQ\nemvijN2VUuTPKMnup9n0gFxDFePLF5C6qnNS11dhRFrJVb9ZxC/dC37H+PxQTF0e\nHfTS6NQfs6ULNIY8odfErNLyzHpycZgoDfTJtrECgYBVq9RPRf6MW2mmlICDdqLZ\nnjCtNLtAXdrhKilWFFonMxobsrnOL5BWOwf2u2cxf0WNQ36mgBA29otT2ZPWuqfa\nLxhQS4I5tWFmiou5spe+yyBcnXtZSjnIqmqg3xX2Y5ii0KsUUymdOSRjy8+OsVNj\nc7xtd1JVZxt4Z70rsUenug==\n-----END PRIVATE KEY-----\n`).replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "elba7rawy-49a39.firebasestorage.app",
      });
    }
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export { db, auth, storage };
