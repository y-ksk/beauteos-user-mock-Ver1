import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BeauteOS (User-Only) — Production-like Prototype
 * 反映ポイント:
 *  - 「なりたい理想像（任意）」/「いまの私（任意）」の2枚構成（プレビュー付）
 *  - 2枚揃うと精度UPのコピー、撮影ガイド、プライバシー表記
 *  - 自動トリミング（モック）トグル、ドラフト保存（画像は保存しない）
 *  - カテゴリは ヘア/ネイル・まつげ/リラク/エステ/美容クリニック
 *  - おすすめ商品: 3つ中2つに「あなた向け」＋根拠表示、CTAは「購入ページ」
 *  - フッターからHPBへ遷移、PC右ペインはAIコパイロット常設
 */

// ====== ダミーAI応答（実装時に差し替え） ======
async function fakeAiRespond(prompt) {
  const ideas = [
    "週次のホームケアと来店のベストミックスを提案します",
    "予算配分を施術/商品/通院に最適化しました",
    "直近2週間の予定から無理のない予約候補を作成しました",
    "悩みタグに基づく商品を3つ比較して最適案を提示します",
  ];
  const pick = ideas[Math.floor(Math.random() * ideas.length)];
  return `【AIプラン提案（モック）]\n${pick}\n\n要件: ${prompt.slice(0, 60)}…`;
}

// ====== UI Tokens ======
const tokens = {
  radius: "rounded-2xl",
  pad: "p-4 md:p-6",
  gap: "gap-4 md:gap-6",
};

// ====== Helper ======
const formatJPY = (n) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
    n
  );

// ====== Root ======
export default function App() {
  const [aiOpen, setAiOpen] = useState(true); // desktop右ペイン
  const [sheetOpen, setSheetOpen] = useState(false); // mobile AI
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("home"); // home | plan | recommend

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header onToggleAI={() => setAiOpen((v) => !v)} />

      <div className="mx-auto max-w-[1400px] px-3 md:px-6">
        <div className={`grid ${tokens.gap} lg:grid-cols-[1fr_360px] grid-cols-1`}>
          {/* Main */}
          <main className="pb-28 md:pb-10">
            <TopIntro />
            <PlanSection onToast={setToast} />
            <TimelineSection onToast={setToast} />
            <RecommendSection />
          </main>

          {/* Right AI Pane (>=lg) */}
          <aside
            className={`hidden lg:block ${
              aiOpen ? "" : "opacity-0 pointer-events-none"
            }`}
          >
            <AIPane />
          </aside>
        </div>
      </div>

      {/* Bottom Tabs (mobile) */}
      <BottomTabs
        active={tab}
        onChange={setTab}
        onOpenAISheet={() => setSheetOpen(true)}
      />

      {/* Mobile AI Sheet */}
      <AnimatePresence>
        <div className="lg:hidden">
          {sheetOpen && (
            <Modal sheet onClose={() => setSheetOpen(false)}>
              <AIPane />
            </Modal>
          )}
        </div>
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-white shadow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({ onToggleAI }) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            B
          </div>
          <div className="text-lg font-semibold tracking-tight">BeauteOS</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onToggleAI}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2"
          >
            🤖 ヘルプ
          </button>
        </div>
        <div className="md:hidden" />
      </div>
    </header>
  );
}

function TopIntro() {
  return (
    <div className={`-mx-3 md:mx-0 ${tokens.pad}`}>
      <div className={`${tokens.radius} border border-neutral-200 bg-white p-4 md:p-6`}>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          あなたの“今”に寄り添う美容プラン
        </h1>
        <p className="mt-2 text-neutral-700">
          「なりたい理想像（任意）」/「いまの私（任意）」（いずれも任意）と、カテゴリ・予算をもとに、来店とホームケアを最適化した8週間プランを生成します。
          <span className="ml-1 text-neutral-500">
            * 両方の画像を追加すると、より精度の高いプランになります。
          </span>
        </p>
      </div>
    </div>
  );
}

// ====== Plan ======
function PlanSection({ onToast }) {
  const [open, setOpen] = useState(false);
  const [planText, setPlanText] = useState("");
  const [resultOpen, setResultOpen] = useState(false);

  return (
    <section
      className={`mt-4 ${tokens.radius} border border-neutral-200 bg-white ${tokens.pad} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold tracking-tight">AIプラン作成</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-black px-4 py-2 text-white"
          >
            作成
          </button>
          <button
            onClick={() => setResultOpen(true)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2"
          >
            前回プラン
          </button>
        </div>
      </div>
      <p className="mt-2 text-neutral-700">
        目標画像・現在地画像（いずれも任意）と、カテゴリ・予算をもとに、来店とホームケアを最適化した8週間プランを生成します。
        <span className="ml-1 text-neutral-500">
          * 両方の画像を追加すると、より精度の高いプランになります。
        </span>
      </p>

      <AnimatePresence>
        {open && (
          <PlanWizard
            onClose={() => setOpen(false)}
            onGenerated={(t) => {
              setPlanText(t);
              setResultOpen(true);
              onToast("プランを生成しました");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resultOpen && (
          <Modal onClose={() => setResultOpen(false)}>
            <div className={`${tokens.pad} ${tokens.radius}`}>
              <div className="text-lg font-semibold">AIプラン（最新）</div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm">
                {planText || "まだプランがありません。"}
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  className="rounded-full bg-black px-4 py-2 text-white"
                  onClick={() => setResultOpen(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}

function PlanWizard({ onClose, onGenerated }) {
  const [goal, setGoal] = useState("半年後の挙式でベストコンディション");
  const [budget, setBudget] = useState(50000);
  const [categories, setCategories] = useState({
    hair: true,
    nail: false,
    relax: false,
    esthe: true,
    clinic: false,
  });

  // 画像（任意）: 理想像/現在地
  const [goalImage, setGoalImage] = useState(null);
  const [goalPreview, setGoalPreview] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [currentPreview, setCurrentPreview] = useState("");

  const fileRefGoal = useRef(null);
  const fileRefCurrent = useRef(null);
  const [loading, setLoading] = useState(false);
  const [autoCrop, setAutoCrop] = useState(true); // モック: 顔/髪/肌の自動トリミング

  // --- Draft保存（テキスト/選択のみ。画像は保存しない） ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("beauteos_plan_draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.goal) setGoal(d.goal);
        if (typeof d.budget === "number") setBudget(d.budget);
        if (d.categories) setCategories((prev) => ({ ...prev, ...d.categories }));
        if (typeof d.autoCrop === "boolean") setAutoCrop(d.autoCrop);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const draft = { goal, budget, categories, autoCrop };
    try {
      localStorage.setItem("beauteos_plan_draft", JSON.stringify(draft));
    } catch {}
  }, [goal, budget, categories, autoCrop]);

  const clearDraft = () => {
    try {
      localStorage.removeItem("beauteos_plan_draft");
    } catch {}
  };

  const onFileGoal = (f) => {
    if (!f) return;
    setGoalImage(f);
    const url = URL.createObjectURL(f);
    setGoalPreview(url);
  };
  const onFileCurrent = (f) => {
    if (!f) return;
    setCurrentImage(f);
    const url = URL.createObjectURL(f);
    setCurrentPreview(url);
  };

  const generate = async () => {
    setLoading(true);
    const cats = Object.entries(categories)
      .filter(([k, v]) => v)
      .map(
        ([k]) =>
          ({
            hair: "ヘアサロン",
            nail: "ネイル・まつげサロン",
            relax: "リラクサロン",
            esthe: "エステサロン",
            clinic: "美容クリニック",
          }[k])
      );

    const prompt = `目標: ${goal}\n予算: ${budget}円/月\nカテゴリ: ${cats.join(
      ", "
    )}\n理想像画像あり: ${goalImage ? "はい" : "いいえ"}\nいまの私画像あり: ${
      currentImage ? "はい" : "いいえ"
    }\n自動トリミング: ${autoCrop ? "有効" : "無効"}\n\n8週間プランを\n- 来店(店種/頻度/所要時間)\n- 自宅ケア(頻度/所要時間)\n- 予約候補(週/時間帯)\n- 予算内配分\n- 2枚の画像がある場合は、質感/輪郭/肌・髪の状態の差分を反映\nで出力。`;

    const text = await fakeAiRespond(prompt);
    setLoading(false);
    onGenerated(text);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className={`${tokens.pad} ${tokens.radius}`}>
        <div className="text-lg font-semibold">プラン作成</div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm text-neutral-600">目標（テキスト）</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-neutral-600">月あたり予算</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="rounded-xl border border-neutral-200 px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm text-neutral-600">カテゴリ</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { id: "hair", label: "ヘアサロン" },
                { id: "nail", label: "ネイル・まつげサロン" },
                { id: "relax", label: "リラクサロン" },
                { id: "esthe", label: "エステサロン" },
                { id: "clinic", label: "美容クリニック" },
              ].map((i) => (
                <label
                  key={i.id}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={categories[i.id]}
                    onChange={(e) =>
                      setCategories((v) => ({ ...v, [i.id]: e.target.checked }))
                    }
                  />
                  {i.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-neutral-600">なりたい理想像（参考イメージ・任意）</div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => fileRefGoal.current?.click()}
                  className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-2"
                >
                  画像を選択
                </button>
                <input
                  ref={fileRefGoal}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileGoal(e.target.files?.[0])}
                />
                {goalPreview ? (
                  <img
                    src={goalPreview}
                    alt="なりたい理想像プレビュー"
                    className="h-16 w-16 rounded-xl object-cover border border-neutral-200"
                  />
                ) : (
                  <span className="text-sm text-neutral-500">未選択</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600">いまの私（現在の状態の写真・任意）</div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => fileRefCurrent.current?.click()}
                  className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-2"
                >
                  画像を選択
                </button>
                <input
                  ref={fileRefCurrent}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileCurrent(e.target.files?.[0])}
                />
                {currentPreview ? (
                  <img
                    src={currentPreview}
                    alt="いまの私プレビュー"
                    className="h-16 w-16 rounded-xl object-cover border border-neutral-200"
                  />
                ) : (
                  <span className="text-sm text-neutral-500">未選択</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={autoCrop}
                  onChange={(e) => setAutoCrop(e.target.checked)}
                />
                自動トリミング（顔/髪/肌の領域検出・モック）
              </label>
              <button
                onClick={clearDraft}
                className="ml-auto text-xs underline text-neutral-500"
              >
                下書きを消去
              </button>
            </div>

            <details className="rounded-xl border border-neutral-200 p-3">
              <summary className="cursor-pointer text-sm font-medium">撮影のコツ</summary>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                <li>明るい場所で正面から。可能なら自然光</li>
                <li>メイク/ヘアセットは控えめ（状態が分かるように）</li>
                <li>髪は顔が隠れないようにまとめる</li>
              </ul>
            </details>

            <details className="rounded-xl border border-neutral-200 p-3">
              <summary className="cursor-pointer text-sm font-medium">プライバシーとデータの扱い</summary>
              <p className="mt-2 text-sm text-neutral-700">
                画像の選択は任意です。モックでは画像はブラウザ内でのみプレビューされ、サーバに保存されません。製品版では「端末内処理」または「即時削除」を選択できる設計を想定しています。
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                ※ ドラフト保存はテキスト/選択項目のみ。画像は保存しません。
              </p>
            </details>
            <div className="text-xs text-neutral-500">
              ※ 2枚とも追加すると差分解析によりスケジュールとホームケア強度の提案がより精密になります。
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2"
          >
            キャンセル
          </button>
          <button
            onClick={generate}
            className="rounded-full bg-black px-4 py-2 text-white"
            disabled={loading}
          >
            {loading ? "生成中…" : "生成"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ====== Timeline ======
function TimelineSection({ onToast }) {
  const [items, setItems] = useState([
    { id: 1, date: "2025-09-02", title: "カット&カラー (表参道A店)", duration: "90分" },
    { id: 2, date: "2025-09-16", title: "フェイシャル (新宿エステB)", duration: "60分" },
  ]);
  return (
    <section
      className={`mt-4 ${tokens.radius} border border-neutral-200 bg-white ${tokens.pad} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold tracking-tight">プランのタイムライン</h3>
        <button
          onClick={() => onToast("HPBで一括予約（モック）完了")}
          className="rounded-full bg-black px-4 py-2 text-white"
        >
          ワンクリック予約
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex items-center justify-between ${tokens.radius} border border-neutral-200 p-3`}
          >
            <div>
              <div className="text-sm text-neutral-500">
                {it.date} ・ {it.duration}
              </div>
              <div className="font-medium">{it.title}</div>
            </div>
            <button className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm">
              変更
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-neutral-500">* HPB連携の操作感を模したモックです。</div>
    </section>
  );
}

// ====== Recommend ======
function RecommendSection() {
  const products = [
    {
      name: "集中ヘアマスク",
      price: 2480,
      reason: "前回のカラー施術で「ダメージが気になる」と相談 → 色持ちと手触りを両立",
      href: "https://maker.example.com/hair-mask",
      personalized: true,
      basis: "表参道A店の施術記録とカウンセリングメモ（サロン提供データ）",
    },
    {
      name: "保湿セラム（夜用）",
      price: 3980,
      reason: "最近のカウンセリングで「乾燥・刺激に弱い」を検知 → 低刺激処方で就寝中にケア",
      href: "https://maker.example.com/night-serum",
      personalized: true,
      basis: "新宿エステBでの問診票と会話ログ（サロン提供データ）",
    },
    {
      name: "UVプロテクト",
      price: 1980,
      reason: "日中のダメージ対策。屋外活動が多い方向けの定番アイテム",
      href: "https://maker.example.com/uv-protect",
      personalized: false,
    },
  ];

  return (
    <section
      className={`mt-4 ${tokens.radius} border border-neutral-200 bg-white ${tokens.pad} shadow-sm`}
    >
      <h3 className="text-base md:text-lg font-semibold tracking-tight">
        プラン実現をサポートするおすすめ商品
      </h3>
      <p className="mt-1 text-neutral-700">
        プランと連動したホームケア商品です。
        <span className="rounded-full bg-black text-white text-xs px-2 py-0.5 ml-1">あなた向け</span>
        が表示された商品は、<strong>最近の施術内容やカウンセリング記録（サロン提供データ）</strong>
        をもとに個別最適化されています。
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p, idx) => (
          <article
            key={idx}
            className={`border border-neutral-200 ${tokens.radius} p-4 bg-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {p.name}
                  {p.personalized && (
                    <span className="rounded-full bg-black text-white text-xs px-2 py-0.5">
                      あなた向け
                    </span>
                  )}
                </div>
                <div className="text-sm text-neutral-500 mt-0.5">{formatJPY(p.price)}</div>
              </div>
              <div aria-hidden className="h-10 w-10 rounded-xl bg-neutral-100 border border-neutral-200" />
            </div>
            <p className="mt-2 text-sm text-neutral-700">おすすめの理由：{p.reason}</p>
            {p.personalized && (
              <div className="mt-1 text-xs text-neutral-500">根拠：{p.basis}</div>
            )}
            <div className="mt-3 flex justify-end">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-black px-4 py-2 text-white inline-flex items-center"
              >
                購入ページ
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ====== AI Pane (User-focused) ======
function AIPane() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "目標・予算・カテゴリを教えてください。無理のない8週間プランを提案します。",
    },
  ]);

  const send = async () => {
    if (!prompt.trim()) return;
    const p = prompt;
    setHistory((h) => [...h, { role: "user", content: p }]);
    setPrompt("");
    setLoading(true);
    const res = await fakeAiRespond(p);
    setHistory((h) => [...h, { role: "assistant", content: res }]);
    setLoading(false);
  };

  const quick = [
    "今週忙しいので在宅ケア多めで",
    "2万円以内で一番効果を感じやすいプランに",
    "肌荒れが出やすいので無理のないスケジュールに",
    "来店は隔週まで。予約候補をまとめて",
  ];

  return (
    <div className={`sticky top-16 ${tokens.radius} border border-neutral-200 bg-white`}>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="font-semibold">🤖 AIコパイロット</div>
        <div className="text-xs text-neutral-500">ユーザー向け</div>
      </div>
      <div className="max-h-[60vh] overflow-auto p-4 space-y-3">
        {history.map((m, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap rounded-2xl px-3 py-2 ${
              m.role === "assistant" ? "bg-neutral-100" : "bg-black text-white"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="animate-pulse text-neutral-500">生成中…</div>}
        <div className="pt-2 border-t border-neutral-200 space-y-2">
          <div className="text-xs text-neutral-600">クイックプロンプト</div>
          <div className="flex flex-wrap gap-2">
            {quick.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(q)}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 p-3">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="要望や不安、予算の上限などを入力…"
            className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:ring-4 focus:ring-neutral-200"
          />
          <button onClick={send} className="rounded-xl bg-black px-4 py-2 text-white">
            送信
          </button>
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          * 実装時は LLM API 接続で応答を差し替え。
        </div>
      </div>
    </div>
  );
}

// ====== Bottom Tabs ======
function BottomTabs({ active, onChange, onOpenAISheet }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:hidden">
      <div className="mx-auto flex max-w-[640px] items-center justify-between px-6 py-3">
        <button
          onClick={() => onChange("home")}
          className={`flex flex-col items-center text-sm ${
            active === "home" ? "font-semibold" : ""
          }`}
        >
          🏠<span>ホーム</span>
        </button>
        <button
          onClick={() => onChange("plan")}
          className={`flex flex-col items-center text-sm ${
            active === "plan" ? "font-semibold" : ""
          }`}
        >
          🗺️<span>プラン</span>
        </button>
        <button
          onClick={onOpenAISheet}
          className="flex -translate-y-4 items-center justify-center rounded-full bg-black px-4 py-3 text-white shadow"
        >
          🤖
        </button>
        <button
          onClick={() => onChange("recommend")}
          className={`flex flex-col items-center text-sm ${
            active === "recommend" ? "font-semibold" : ""
          }`}
        >
          🛍️<span>おすすめ</span>
        </button>
        {/* HPB 外部リンク */}
        <a
          href="https://beauty.hotpepper.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-sm"
        >
          🅗<span>HPB</span>
        </a>
      </div>
    </nav>
  );
}

// ====== Modal ======
function Modal({ children, onClose, sheet = false }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/30 px-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: sheet ? 40 : -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: sheet ? 40 : -8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`${
          sheet ? "w-full max-w-[640px]" : "w-full max-w-[880px]"
        } ${tokens.radius} border border-neutral-200 bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
