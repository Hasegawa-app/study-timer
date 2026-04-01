"use client";

import { useEffect, useMemo, useState } from "react";

type StudyLog = {
  id: string;
  subject: string;
  content: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  method: "timer" | "manual";
};

type ActiveSession = {
  subject: string;
  content: string;
  startTime: string;
};

const subjects = ["英語", "数学", "国語", "理科", "社会", "情報", "その他"];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分`;
  return `${hours}時間${rest}分`;
}

export default function Page() {
  const [subject, setSubject] = useState("英語");
  const [content, setContent] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [now, setNow] = useState(Date.now());

  const [manualSubject, setManualSubject] = useState("英語");
  const [manualContent, setManualContent] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");

  useEffect(() => {
    const savedLogs = localStorage.getItem("studyLogs");
    const savedActive = localStorage.getItem("activeSession");

    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch {
        setLogs([]);
      }
    }

    if (savedActive) {
      try {
        setActive(JSON.parse(savedActive));
      } catch {
        setActive(null);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studyLogs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (active) {
      localStorage.setItem("activeSession", JSON.stringify(active));
    } else {
      localStorage.removeItem("activeSession");
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  const startStudy = () => {
    if (!content.trim()) {
      alert("勉強内容を入力してや");
      return;
    }

    if (active) return;

    setActive({
      subject,
      content: content.trim(),
      startTime: new Date().toISOString(),
    });
  };

  const endStudy = () => {
    if (!active) return;

    const endTime = new Date();
    const start = new Date(active.startTime);

    const durationMinutes = Math.max(
      1,
      Math.floor((endTime.getTime() - start.getTime()) / 60000)
    );

    const newLog: StudyLog = {
      id: crypto.randomUUID(),
      subject: active.subject,
      content: active.content,
      startTime: active.startTime,
      endTime: endTime.toISOString(),
      durationMinutes,
      method: "timer",
    };

    setLogs((prev) => [newLog, ...prev]);
    setActive(null);
    setContent("");
    setSubject("英語");
  };

  const addManualLog = () => {
    if (!manualContent.trim()) {
      alert("手動記録の勉強内容を入力してや");
      return;
    }

    const minutes = Number(manualMinutes);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      alert("分数は1以上の数字を入れてや");
      return;
    }

    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60000);

    const newLog: StudyLog = {
      id: crypto.randomUUID(),
      subject: manualSubject,
      content: manualContent.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: minutes,
      method: "manual",
    };

    setLogs((prev) => [newLog, ...prev]);
    setManualSubject("英語");
    setManualContent("");
    setManualMinutes("");
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const totalMinutes = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  }, [logs]);

  const activeElapsedMinutes = active
    ? Math.max(
        1,
        Math.floor((now - new Date(active.startTime).getTime()) / 60000)
      )
    : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            勉強ログ
          </h1>
          <p
            style={{
              marginTop: 8,
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            タイマーでも手入力でも勉強時間を記録できるアプリ
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: 8 }}>
              合計勉強時間
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {formatMinutes(totalMinutes)}
            </div>
          </div>

          <div
            style={{
              background: active ? "#eff6ff" : "#ffffff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              border: active ? "1px solid #93c5fd" : "1px solid #e5e7eb",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: 8 }}>
              現在の状態
            </div>

            {active ? (
              <>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    marginBottom: 6,
                  }}
                >
                  計測中
                </div>
                <div style={{ color: "#374151", marginBottom: 4 }}>
                  {active.subject} / {active.content}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                  経過時間：{formatMinutes(activeElapsedMinutes)}
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 6,
                  }}
                >
                  未計測
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                  タイマー開始中の内容がここに出る
                </div>
              </>
            )}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 16,
                fontSize: "1.1rem",
                color: "#111827",
              }}
            >
              タイマーで記録
            </h2>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#374151",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  科目
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!!active}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    background: active ? "#f3f4f6" : "#fff",
                    outline: "none",
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#374151",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  勉強内容
                </label>
                <input
                  type="text"
                  placeholder="例：英文法、微分、化学平衡"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!!active}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    background: active ? "#f3f4f6" : "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                <button
                  onClick={startStudy}
                  disabled={!!active}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: active ? "not-allowed" : "pointer",
                    background: active ? "#cbd5e1" : "#2563eb",
                    color: "#fff",
                  }}
                >
                  開始
                </button>

                <button
                  onClick={endStudy}
                  disabled={!active}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: active ? "pointer" : "not-allowed",
                    background: active ? "#dc2626" : "#cbd5e1",
                    color: "#fff",
                  }}
                >
                  終了
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 16,
                fontSize: "1.1rem",
                color: "#111827",
              }}
            >
              手入力で記録
            </h2>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#374151",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  科目
                </label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#374151",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  勉強内容
                </label>
                <input
                  type="text"
                  placeholder="例：単語帳、確率、化学基礎"
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    background: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#374151",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  勉強時間（分）
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="例：45"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    background: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <button
                  onClick={addManualLog}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 18px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "#16a34a",
                    color: "#fff",
                  }}
                >
                  手動で追加
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                color: "#111827",
              }}
            >
              記録一覧
            </h2>
            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              {logs.length}件
            </div>
          </div>

          {logs.length === 0 ? (
            <div
              style={{
                padding: "24px 12px",
                textAlign: "center",
                color: "#6b7280",
                background: "#f9fafb",
                borderRadius: 12,
                border: "1px dashed #d1d5db",
              }}
            >
              まだ記録がないで
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            background: "#e0e7ff",
                            color: "#3730a3",
                            borderRadius: 999,
                            padding: "4px 10px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                          }}
                        >
                          {log.subject}
                        </span>

                        <span
                          style={{
                            display: "inline-block",
                            background:
                              log.method === "timer" ? "#dbeafe" : "#dcfce7",
                            color:
                              log.method === "timer" ? "#1d4ed8" : "#166534",
                            borderRadius: 999,
                            padding: "4px 10px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                          }}
                        >
                          {log.method === "timer" ? "タイマー" : "手入力"}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: 8,
                        }}
                      >
                        {log.content}
                      </div>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "0.92rem",
                          lineHeight: 1.7,
                        }}
                      >
                        開始：{formatDateTime(log.startTime)}
                        <br />
                        終了：{formatDateTime(log.endTime)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 10,
                        minWidth: 100,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        {formatMinutes(log.durationMinutes)}
                      </div>

                      <button
                        onClick={() => deleteLog(log.id)}
                        style={{
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          background: "#ef4444",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}