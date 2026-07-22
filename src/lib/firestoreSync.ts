import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Loan, Transaction, Lender } from '../types';

const LOANS_COLLECTION = 'loans';
const TRANSACTIONS_COLLECTION = 'transactions';
const LENDERS_COLLECTION = 'lenders';

// Real-time listener for Loans
export function subscribeToLoans(onUpdate: (loans: Loan[]) => void) {
  try {
    const q = query(collection(db, LOANS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const loans: Loan[] = [];
      snapshot.forEach((docSnap) => {
        loans.push(docSnap.data() as Loan);
      });
      // Sort newest created loans first
      loans.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(loans);
    }, (error) => {
      console.warn('Firestore loans subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to listen to Firestore loans:', err);
    return () => {};
  }
}

// Real-time listener for Transactions
export function subscribeToTransactions(onUpdate: (txs: Transaction[]) => void) {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const txs: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        txs.push(docSnap.data() as Transaction);
      });
      txs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      onUpdate(txs);
    }, (error) => {
      console.warn('Firestore txs subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to listen to Firestore txs:', err);
    return () => {};
  }
}

// Save or Update a single Loan
export async function syncLoanToFirestore(loan: Loan) {
  try {
    const docRef = doc(db, LOANS_COLLECTION, loan.id);
    await setDoc(docRef, loan, { merge: true });
  } catch (err) {
    console.error('Error syncing loan to Firestore:', err);
  }
}

// Delete a loan from Firestore
export async function deleteLoanFromFirestore(loanId: string) {
  try {
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting loan from Firestore:', err);
  }
}

// Save or Update a Transaction
export async function syncTransactionToFirestore(tx: Transaction) {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, tx.id);
    await setDoc(docRef, tx, { merge: true });
  } catch (err) {
    console.error('Error syncing transaction to Firestore:', err);
  }
}

// Save or Update Lender Profile
export async function syncLenderToFirestore(lender: Lender) {
  try {
    const docRef = doc(db, LENDERS_COLLECTION, lender.email.toLowerCase().trim());
    await setDoc(docRef, lender, { merge: true });
  } catch (err) {
    console.error('Error syncing lender profile to Firestore:', err);
  }
}

// Delete Lender Profile from Firestore
export async function deleteLenderFromFirestore(email: string) {
  try {
    const docRef = doc(db, LENDERS_COLLECTION, email.toLowerCase().trim());
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting lender from Firestore:', err);
  }
}

// Real-time listener for Lenders
export function subscribeToLenders(onUpdate: (lenders: Lender[]) => void) {
  try {
    const q = query(collection(db, LENDERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const lenders: Lender[] = [];
      snapshot.forEach((docSnap) => {
        lenders.push(docSnap.data() as Lender);
      });
      onUpdate(lenders);
    }, (error) => {
      console.warn('Firestore lenders subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to listen to Firestore lenders:', err);
    return () => {};
  }
}

// Seed initial data to Firestore if database collections are currently empty
export async function seedFirestoreIfEmpty(initialLoans: Loan[], initialTxs: Transaction[]) {
  try {
    const loansSnap = await getDocs(collection(db, LOANS_COLLECTION));
    if (loansSnap.empty) {
      console.log('Seeding initial loans to Firebase Firestore...');
      for (const loan of initialLoans) {
        await syncLoanToFirestore(loan);
      }
    }

    const txsSnap = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    if (txsSnap.empty) {
      console.log('Seeding initial transactions to Firebase Firestore...');
      for (const tx of initialTxs) {
        await syncTransactionToFirestore(tx);
      }
    }
  } catch (err) {
    console.warn('Firestore seeding check skipped/errored:', err);
  }
}
