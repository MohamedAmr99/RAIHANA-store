# 🏛️ وثيقة RAIHANA STORE — المرجع الشامل للمشروع (Architecture & Guidelines)

---

## 📌 1. فكرة المشروع ونظرة عامة
**متجر ريحانة (RAIHANA Store):**
منصة تجارة إلكترونية فاخرة متخصصة في:
* **العطور المستوحاة (Inspired Perfumes):** للرجال والنساء والـ Unisex بأعلى جودة وثبات.
* **البخور الملكي (Incense):** أنواع مختارة بعناية.
* **الفواحات والمعطرات (Diffusers & Fresheners):** للمنازل والمكاتب.

الموقع مبني بتصميم عصري باللونين الأسود والذهبي (*Dark Luxury Aesthetics*) مع دعم كامل لتجربة المستخدم باللغتين **العربية (RTL)** و **الإنجليزية (LTR)**.

---

## 💻 2. المكدس التقني (Tech Stack)
* **Frontend Framework:** React 19 + Vite 7 (Single Page Application).
* **Styling:** Tailwind CSS v4 + خطوط عربية كلاسيكية وتأثيرات زجاجية (Glassmorphism & Gold Theme).
* **Animations:** Framer Motion (انتقالات سلسة، حركات للكروت والسلة والصفحات).
* **Icons:** Lucide React.
* **Localization:** i18next + react-i18next (العربية افتراضياً مع التبديل للإنجليزية).
* **Backend & Database:** Firebase v12 (Cloud Firestore + Firebase Authentication + Firebase Storage).
* **Image Hosting:** Cloudinary لرفع وإدارة صور المنتجات الجديدة من لوحة التحكم.

---

## 📐 3. بنية المشروع وهيكل الملفات (Project Structure)

```text
RAIHANA Store VR 2/
├── firestore.rules          # قواعد الأمان الصارمة لقاعدة البيانات (مغلقة إلا للأدمن)
├── jsconfig.json            # إعدادات لغة JavaScript و JSX لمحرر VS Code
├── package.json             # الاعتماديات ومكتبات المشروع
├── PROJECT_GUIDELINES.md    # هذا الملف — المرجع الشامل للمشروع
├── public/                  # الصور الثابتة، مقاطع الفيديو والخطوط
│   ├── images/
│   └── videos/
└── src/
    ├── App.jsx              # نقطة الربط والتوجيه (Router) وحاوي السلة CartProvider
    ├── firebase.js          # تهيئة الاتصال بخدمات Firebase
    ├── components/
    │   ├── Navbar.jsx       # شريط التنقل مع أيقونة السلة التفاعلية ومحول اللغة
    │   ├── Hero.jsx         # الواجهة الرئيسية مع الفيديو المحسن
    │   ├── ProductCard.jsx  # كارت عرض المنتج (عرض السعر الأقل، إضافة للسلة، التفاصيل)
    │   ├── CartDrawer.jsx   # درج السلة المنزلق مع التحكم في الكميات وحساب الشحن
    │   └── ProtectedRoute.jsx
    ├── context/
    │   └── CartContext.jsx  # إدارة حالة السلة وحفظها تلقائياً في LocalStorage
    ├── data/
    │   └── perfumes.js      # البيانات الأولية المحلية للعطور والأسعار
    ├── hooks/
    │   ├── usePerfumes.js   # جلب منتجات العطور لحظياً من Firestore مع Fallback محلي
    │   └── useSettings.js   # جلب إعدادات المتجر (الهاتف، الشحن، رسائل الواتساب)
    ├── i18n/                # ملفات الترجمة (ar.json / en.json)
    └── pages/
        ├── Home.jsx
        ├── Perfumes.jsx
        ├── ProductDetails.jsx
        ├── Checkout.jsx     # إتمام الطلب — يدعم سلة كاملة أو شراء سريع لمنتج
        ├── Admin.jsx        # لوحة التحكم — إدارة المنتجات والأسعار والطلبات والشحن
        └── Login.jsx
```

---

## 🔒 4. قواعد الأمان وصلاحيات النظام (Security Architecture)

1. **الوصول للوحة الأدمن (`isAdmin`):**
   * لا يُقبل أي مستخدم مجهول أو تسجيل عشوائي.
   * القائمة البيضاء محددة في `firestore.rules`:
     ```
     amohamedamr99@gmail.com
     admin@store.com
     ```
2. **المنتجات (`perfumes`):** القراءة مفتوحة، الكتابة للأدمن فقط.
3. **الطلبات (`orders`):** الإنشاء متاح للعملاء بشروط أمان مشددة (حالة `Pending` إجبارية)، القراءة والتعديل للأدمن فقط.
4. **لا `isDev` bypass:** يجب دائماً التحقق من `auth.currentUser` ومطابقته لـ `ALLOWED_ADMINS`.

---

## 🛒 5. قواعد العمل في المتجر (Business Logic)

### أ. نظام التسعير والأحجام:
* لكل عطر حجمان: **50ML** و **100ML**، كل منهما بسعر مستقل في `sizePrices`.
* `ProductCard`: يعرض السعر الأقل بدون نص إضافي.
* `ProductDetails`: الحجم والسعر الافتراضي = 50ML، يتغير لحظياً باختيار المستخدم.

### ب. سلوك سلة المشتريات:
* "أضف للسلة" من الكارت: يُضيف مرة واحدة فقط — إذا وُجد المنتج مسبقاً يفتح السلة ولا يكرر الكمية.
* الزيادة والنقصان: عبر `+` و `-` في السلة فقط.
* السلة محفوظة في `localStorage`.

### ج. إتمام الطلب (`Checkout`):
* يدعم: طلب السلة كاملة (`/checkout`) أو شراء سريع (`/checkout/:id?size=X`).
* حقل المحافظة: قائمة منسدلة بـ 25 محافظة مصرية (إجبارية).
* الشحن يُحسب ديناميكياً بحسب المحافظة المختارة.

### د. نظام أسعار الشحن المحافظاتي:
* مخزّن في Firestore `settings/store` حقل `shippingRates` (map).
* أولوية الحساب:
  ```
  shippingRates[المحافظة]  →  shippingRates.default  →  shippingFee  (fallback)
  ```
* يُدار من Admin → تبويب الإعدادات → "أسعار الشحن لكل محافظة".

### هـ. نظام التوصيل المجاني (Free Shipping Promotion):
* **المتحكمات في الإعدادات (`settings/store`):**
  - `freeShippingEnabled`: (Boolean) تفعيل أو تعطيل العرض كلياً.
  - `freeShippingThreshold`: (Number) الحد الأدنى لقيمة المشتريات بالجنيه للحصول على شحن مجاني (لو تم ضبطه على `0`، يصبح الشحن مجانياً للجميع).
* **سلوك النظام في الواجهة:**
  - **سلة التسوق (`CartDrawer`):** إظهار شريط تقدم تفاعلي يوضح المبلغ المتبقي للوصول للشحن المجاني، أو علامة "🎉 مجاناً" عند التأهل.
  - **صفحة الدفع (`Checkout`):** حساب تكلفة الشحن تلقائياً كـ `0` جنيه عند استيفاء الشرط، مع إظهار التهنئة في تفاصيل الطلب وعلى رسالة تأكيد الواتساب وتفاصيل صفحة النجاح.
  - **لوحة التحكم (`Admin`):** مفتاح تبديل Toggle لتشغيل/إيقاف العرض وحقل إدخال رقمي مرن لتحديد الحد الأدنى.

---

## ⚙️ 6. بروتوكول التطوير والاختبار (Testing Protocol)

**قبل أي commit:**
```bash
# 1. فحص TypeScript
npx tsc -p jsconfig.json --noEmit   # يجب أن يخرج 0 أخطاء

# 2. بناء الإنتاج
npm run build                        # يجب أن يخرج بـ exit code 0 و "✓ built"
```

**قواعد إضافية:**
* الحفاظ على أسماء وامتدادات الملفات القديمة (لا تكسر روابط Firestore).
* دعم الحقول القديمة والجديدة معاً (*Backward Compatibility*).
* استخدام Conventional Commits: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:`.

---

## 🧠 7. الدروس المستفادة من الأخطاء (Lessons Learned Log)

> هذا القسم يُحدَّث تلقائياً بعد كل إصلاح جوهري.

---

### 🔴 BUG-01: "صفحة النجاح تعرض 0 جنيه"
**الملف:** `Checkout.jsx`

**السبب — Stale Closure Bug:**
بعد `setSuccess(true)` يُعاد رسم الكومبوننت. في هذه اللحظة:
- `clearCart()` يُفرغ السلة → `cart = []` → `cartSubtotal = 0`.
- `orderItems` وكل القيم المشتقة منها تصبح `[]` و `0`.
- صفحة النجاح كانت تقرأ من هذه المتغيرات الحية بدلاً من القيم وقت الإرسال.

**الحل — Snapshot Pattern:**
حفظ نسخة ثابتة من كل القيم لحظة الضغط على "تأكيد الطلب":
```js
setLastOrderDetails({
  ...payload,
  snapshotTotal:    Number(totalAmount),
  snapshotSubtotal: Number(subtotal),
  snapshotShipping: Number(shippingCost),
  snapshotCity:     formData.city,
  snapshotItems:    [...orderItems],  // ← spread لعمل نسخة مستقلة
});
```
صفحة النجاح تقرأ حصرياً من `lastOrderDetails.snapshotX`.

**القاعدة المستفادة:**
> ✅ أي قيمة يجب أن تظهر **بعد** حدث (submit / success) يجب تخزينها في state منفصل وقت الحدث، وليس قراءتها من متغيرات قابلة للتغير لاحقاً.

---

### 🔴 BUG-02: تكرار الكمية عند الضغط مرتين على "أضف للسلة"
**الملف:** `CartContext.jsx`

**السبب:** `addToCart` كانت تزيد الكمية دائماً بغض النظر عن وجود المنتج.

**الحل:**
```js
const addToCart = (item) => {
  setCart((prev) => {
    const exists = prev.find(
      (i) => i.productId === item.productId && i.size === item.size
    );
    if (exists) {
      setIsCartOpen(true);
      return prev; // لا تعدّل الكمية
    }
    return [...prev, { ...item, quantity: 1 }];
  });
  setIsCartOpen(true);
};
```

**القاعدة المستفادة:**
> ✅ دالة `addToCart`: تضيف فقط عند الغياب، تفتح السلة فقط عند التكرار.

---

### 🔴 BUG-03: ESLint `react-refresh/only-export-components`
**الملف:** `CartContext.jsx`

**السبب:** تصدير `useCart` (hook عادي) من نفس ملف يصدّر Component يُربك React Fast Refresh.

**الحل:**
```js
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => { ... };
```

---

### 🔴 BUG-04: تحذيرات VS Code الحمراء (false positives) في JSX
**السبب:** غياب `jsconfig.json` → VS Code لا يتعرف على JSX.

**الحل:** إنشاء `jsconfig.json` في جذر المشروع:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

---

### 🔴 BUG-05: ثغرة أمنية — تجاوز فحص الأدمن بـ `isDev`
**الملف:** `Admin.jsx`

**السبب:** شرط `isDev` كان يتجاوز `auth.currentUser` في بعض الـ listeners.

**الحل:** حذف `isDev` بالكامل، الاعتماد فقط على `auth.currentUser` وقائمة `ALLOWED_ADMINS`.

**القاعدة المستفادة:**
> ✅ لا يوجد bypass لأي فحص أمني في أي بيئة، حتى في Development.

---

### 🟡 PERF-01: ثابت كبير داخل الكومبوننت
**الملف:** `Checkout.jsx`

**المشكلة:** `EGYPTIAN_GOVERNORATES` (25 عنصر) كانت تُنشأ من جديد في **كل render**.

**الحل:** نقل الثوابت الكبيرة لمستوى الـ module (خارج الكومبوننت):
```js
// ✅ مرة واحدة عند تحميل الملف
const EGYPTIAN_GOVERNORATES = ["القاهرة", ...];

const Checkout = () => {
  // ❌ كانت هنا — خطأ
};
```

**القاعدة المستفادة:**
> ✅ أي مصفوفة أو كائن ثابت لا يعتمد على props/state → ضعه **خارج** الكومبوننت على مستوى الـ module.

---

### 🟡 PERF-02: حساب قوائم الطلب بـ `useMemo`
**الملف:** `Checkout.jsx`

**المشكلة:** `orderItems` و `subtotal` كانتا بـ `let` خام → تُعاد حسابهما في كل render حتى لو لم يتغير `cart`.

**الحل:**
```js
const { orderItems, subtotal } = useMemo(() => {
  if (isDirectCheckout && singleProduct) {
    // ... direct checkout logic
    return { orderItems: [...], subtotal: itemPrice };
  }
  const items = cart.map((item) => ({ ... }));
  return { orderItems: items, subtotal: cartSubtotal };
}, [isDirectCheckout, singleProduct, directSize, cart, cartSubtotal]);
```

**القاعدة المستفادة:**
> ✅ أي حساب مشتق من props/state ويُستخدم في الـ render → استخدم `useMemo` مع dependencies صحيحة.

---

### 🟡 PERF-03: دوال الأحداث بـ `useCallback`
**الملف:** `Checkout.jsx`

**المشكلة:** `handleChange` و `handleSubmit` كدوال عادية → تُنشأ من جديد في كل render.

**الحل:**
```js
// handleChange — لا تحتاج dependencies (تستخدم functional updater)
const handleChange = useCallback((e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
}, []);

// handleSubmit — تحتاج dependencies لأنها تقرأ من scope
const handleSubmit = useCallback(async (e) => {
  // ...
}, [orderItems, subtotal, shippingCost, totalAmount, formData, isDirectCheckout, clearCart, lang]);
```

**القاعدة المستفادة:**
> ✅ دوال الأحداث (`handleX`) المُمررة لعناصر JSX → استخدم `useCallback`.
> ✅ إذا كانت الدالة تستخدم `setX((prev) => ...)` بدلاً من `x` مباشرة، فهي لا تحتاج dependencies.

---

### 🟡 TAILWIND-01: كلاسات Arbitrary Values
**الملف:** `Admin.jsx`

**المشكلة:** استخدام `min-w-[700px]`, `z-[100]` بدلاً من القيم القياسية.

**الحل:** استبدالها بالكلاسات المكافئة في Tailwind v4:
| Arbitrary | Standard |
|-----------|----------|
| `min-w-[700px]` | `min-w-175` |
| `min-w-[800px]` | `min-w-200` |
| `min-w-[220px]` | `min-w-55` |
| `z-[100]` | `z-100` |

**القاعدة المستفادة:**
> ✅ في Tailwind v4 — تحقق دائماً من وجود كلاس قياسي قبل استخدام الـ arbitrary value `[]`.

---

### 🔴 BUG-06: تشوه أزرار التبديل (Toggle Switch) في واجهات الـ RTL
**الملف:** `Admin.jsx`

**السبب:**
الصفحة تعمل باتجاه `dir="rtl"`. تطبيق `translate-x` على دائرة المفتاح يغير اتجاه الحركة أو يحسب الإزاحة خارج إطار الزر البيضاوي فتخرج الكرة البيضاء بعيداً عنه في منتصف الشاشة.

**الحل:**
عزل حاوية المفتاح صراحة بـ `dir="ltr"` مع استخدام حشوة هندسية دقيقة:
```jsx
<div dir="ltr" className="inline-flex items-center">
  <button
    type="button"
    onClick={toggle}
    className="relative inline-flex h-8 w-15 rounded-full p-1 transition-colors"
  >
    <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
      enabled ? "translate-x-7" : "translate-x-0"
    }`} />
  </button>
</div>
```

**القاعدة المستفادة:**
> ✅ أي Toggle Switch مبني بتحريك الـ X-axis يجب أن يُغلف صراحة بـ `dir="ltr"` لمنع تضارب الـ RTL.

---

### 🔴 BUG-07: رفض Firestore للحفظ بصمت بسبب قيم `undefined`
**الملف:** `useSettings.js`

**السبب:**
عند إفراغ حقل نصي أو تركه بدون قيمة يُسند `undefined`. مكتبة Firebase SDK ترفض رفضاً قاطعاً كتابة أي مستند يحوي مفاتيح بقيمة `undefined` وترمي `Unsupported field value: undefined` مما يمنع الحفظ.

**الحل:**
تنظيف الكائن قبل إرساله إلى `setDoc`:
```javascript
const sanitizeFirestoreData = (data) => {
  if (Array.isArray(data)) return data.map(sanitizeFirestoreData);
  if (data !== null && typeof data === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) clean[k] = sanitizeFirestoreData(v);
    }
    return clean;
  }
  return data;
};
```

**القاعدة المستفادة:**
> ✅ لا ترسل أي كائن مباشرة إلى Firestore دون التأكد من خلوه من قيم `undefined`.
