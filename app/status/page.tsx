"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Application } from "@/types";
import Container from "@/components/layout/Container";
import ApplicationStatusTracker from "@/components/user/ApplicationStatusTracker";

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const q = query(collection(db, "applications"), where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);
      const list: Application[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(list);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      alert("照会に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">応募状況・進捗確認</h1>
          <p className="text-xs text-slate-500">応募時に使用したメールアドレスを入力してください。</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            {loading ? "照会中..." : "照会する"}
          </button>
        </form>

        {hasSearched && <ApplicationStatusTracker applications={applications} />}
      </div>
    </Container>
  );
}