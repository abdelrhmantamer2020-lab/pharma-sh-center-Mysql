export interface ScreenGuide {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  categoryAr: string;
  categoryEn: string;
  kpisAr: string[];
  kpisEn?: string[];
  featuresAr: { title: string; desc: string }[];
  featuresEn?: { title: string; desc: string }[];
  stepsAr: string[];
  stepsEn?: string[];
  tipsAr: string[];
  tipsEn?: string[];
}

export const SYSTEM_HELP_SECTIONS: ScreenGuide[] = [
  {
    id: 'workflow_overview',
    icon: '🗺️',
    titleAr: 'دليل دورة العمل الشاملة من البداية للنهاية (A to Z Master Workflow)',
    titleEn: 'End-to-End Master Workflow (A to Z)',
    shortDescAr: 'خريطة الطريق المتكاملة لكيفية ترابط وحدات المنظومة معاً: تسجيل المستفيدين ⬅️ الجداول العلاجية ⬅️ توريد الأدوية ⬅️ الصرف اليومي الذكي ⬅️ رصد السلوك والأعراض ⬅️ الجرد والتسوية ⬅️ إصدار التقارير الرقابية.',
    shortDescEn: 'Comprehensive clinical roadmap illustrating how all system modules interconnect: resident admission, dosing regimens, drug receiving, dispensing, behavioral tracking, audit reconciliation, and regulatory reporting.',
    categoryAr: 'دليل التشغيل العام',
    categoryEn: 'General Operations',
    kpisAr: [
      'التكامل السريري التلقائي: لا توجد خطوة منفصلة عن الأخرى؛ كل عملية صرف تخصم المخزون وتوثق في سجل التدقيق وتنعكس على مؤشرات النزيل فوراً.',
      'السلامة المزدوجة (Dual Safety): فحص فوري للحساسية وتعارض الجرعات يسبق أي حركة صرف دوائي في ثوانٍ معدودة.',
      'الاستجابة اللحظية: مؤشرات المخزون وحسابات الصلاحية (FEFO) تُحدث آنياً دون الحاجة لإعادة تحميل النظام.',
      'التوثيق الإلزامي غير القابل للتعديل: كل حركة نظامية تسجل هوية الموظف المنفذ والتاريخ بالساعة والدقيقة والثانية.'
    ],
    kpisEn: [
      'Automated clinical integration: dispensing instantly decrements inventory, updates resident profile, and logs immutable audit trail.',
      'Dual safety shield: automatic allergy screening and duplicate-dose prevention precede every transaction.',
      'Real-time responsiveness: inventory valuations and FEFO shelf-life metrics update instantly without page reloads.',
      'Immutable compliance trail: every single operational action captures staff signature with precision timestamps.'
    ],
    featuresAr: [
      {
        title: 'المرحلة 1: تهيئة المستودع وتسجيل الأدوية',
        desc: 'يتم تسجيل الأصناف بالاسمين التجاريين (العربي والإنجليزي) والاسم العلمي، مع تحديد أرقام التشغيلات، أسعار الوحدات، وتواريخ الصلاحية لإنشاء قاعدة المخزون الأساسية.'
      },
      {
        title: 'المرحلة 2: تسجيل المستفيد وجدول الجرعات الـ 24 ساعة',
        desc: 'إنشاء ملف المستفيد وتدوين الحساسيات المؤكدة، وتوزيع أدويته اليومية على فترات (صباح، ظهر، مساء) مع تعليمات البلع لتوجيه طاقم التمريض.'
      },
      {
        title: 'المرحلة 3: الصرف الذكي والوقاية من الأخطاء',
        desc: 'صرف الأدوية للمستفيدين مع فحص آلي لمنع تكرار الجرعة في نفس اليوم، والتحقق التلقائي من الحساسية، واختيار أجزاء الحبوب بدقة (ربع، نصف، حبة).'
      },
      {
        title: 'المرحلة 4: المتابعة السلوكية والأعراض الجانبية (BCMA)',
        desc: 'رصد تأثيرات الأدوية النفسية والعصبية وربط التغيرات السلوكية بالدواء المشتبه به مع إمكانية توليد تحليل سريري ذكي عبر الذكاء الاصطناعي.'
      },
      {
        title: 'المرحلة 5: الجرد الدوري والرقابة الدوائية والتقارير الرسمية',
        desc: 'إجراء التسويات المخزنية الدورية وتوليد تقارير PDF الرسمية المعتمدة بختم الصيدلية ومشاركتها عبر WhatsApp أو البريد الإلكتروني.'
      }
    ],
    featuresEn: [
      {
        title: 'Phase 1: Drug Master Catalog & Receiving',
        desc: 'Register medicines with bilingual trade names, generic substance, batch numbers, unit prices, and expiration dates.'
      },
      {
        title: 'Phase 2: Resident Admission & 24h Dosage Chart',
        desc: 'Create patient profile, register confirmed allergies, and schedule morning/noon/evening doses with swallowing directives.'
      },
      {
        title: 'Phase 3: Smart Dispensing & Intercept Shields',
        desc: 'Dispense medications backed by duplicate-dose prevention, automatic allergy cross-checking, and fractional tablet selectors.'
      },
      {
        title: 'Phase 4: Behavioral Monitoring & Side Effects',
        desc: 'Log psychotropic drug effects, connect behavioral shifts to suspect medicines, and generate predictive AI clinical dossiers.'
      },
      {
        title: 'Phase 5: Stock Reconciliation & Regulatory PDFs',
        desc: 'Perform periodic physical inventory audits, generate certified PDF reports with pharmacy seals, and dispatch dispatches.'
      }
    ],
    stepsAr: [
      'الخطوة 1: تسجيل الدخول الآمن بحساب معتمد (مدير نظام أو صيدلي أو مشاهد) مع التحقق من عدم وجود جلسة نشطة أخرى متزامنة.',
      'الخطوة 2: فحص لوحة التحكم الرئيسية لمطالعة التنبيهات الحرجة: الأدوية المنتهية، النواقص، والإحالات الطبية المستحقة خلال 24 ساعة.',
      'الخطوة 3: التوجه لإدارة المخزون والتأكد من توافر الأصناف أو إضافة أصناف وتوريدات جديدة مع تحديد أسعارها وتواريخها.',
      'الخطوة 4: مراجعة شاشة المستفيدين للتحقق من أسماء المستفيدين، غرفهم، وجداول جرعاتهم المعتمدة وتحديث أي حساسية جديدة.',
      'الخطوة 5: تنفيذ عمليات الصرف اليومية من شاشة الصرف السريع باستخدام مربعات البحث الذكية وأزرار الجرعات الدقيقة.',
      'الخطوة 6: تدوين أي ملاحظات سلوكية أو عوارض جانبية طارئة في شاشة راصد السلوك عند ظهورها.',
      'الخطوة 7: إجراء جرد دوري وتسوية أي عجز أو تالف في شاشة التسوية المخزنية مع توثيق الأسباب في سجل التدقيق.',
      'الخطوة 8: استخراج وتصدير تقرير الرقابة الدوائية الشامل بصيغة PDF الرسمية بنهاية كل وردية أو أسبوع للمراجعة الإدارية.'
    ],
    stepsEn: [
      'Step 1: Sign in securely with authorized credentials while single-session concurrency safeguard prevents duplicate logins.',
      'Step 2: Review Executive Dashboard for critical alarms: expired medicines, low stock thresholds, and 24h hospital referrals.',
      'Step 3: Access Inventory to verify stock balances, register new supplies, and manage batch pricing and expiration dates.',
      'Step 4: Check Residents screen to review profiles, room assignments, active 24h dosing charts, and documented allergies.',
      'Step 5: Execute routine dispensing via Medication Dispense utilizing live search filters and fractional tablet buttons.',
      'Step 6: Document any psychotropic side effects or agitation in Behavioral Tracker immediately upon observation.',
      'Step 7: Perform periodic shelf audits in Stock Adjustment, documenting discrepancies into the permanent audit ledger.',
      'Step 8: Generate and export official Comprehensive Drug Safety PDF reports at shift close for executive compliance.'
    ],
    tipsAr: [
      'ابدأ يوم عملك دائماً بمراجعة بطاقة "قريبة انتهاء الصلاحية" لتقديم الأدوية الأقدم صلاحية وفق قاعدة (FEFO: First Expired, First Out).',
      'تأكد من عدم تسجيل الخروج المفاجئ بإغلاق المتصفح مباشرة، بل استخدم زر تسجيل الخروج في الشريط العلوي لإغلاق الجلسة بأمان.',
      'في حال حدوث أي خطأ في إدخال كمية الصرف، لا تكرر العملية؛ قم بإجراء تسوية مخزنية تصحيحية لضبط الرصيد وتوثيق السبب.'
    ],
    tipsEn: [
      'Always start your shift reviewing the Near Expiry card to enforce FEFO (First-Expired, First-Out) and prevent waste.',
      'Always use the official Sign Out button in the top navigation to terminate sessions cleanly.',
      'If a dispensing error occurs, perform a compensatory stock audit adjustment with detailed rationale rather than re-dispensing.'
    ]
  },
  {
    id: 'dashboard',
    icon: '📊',
    titleAr: 'لوحة التحكم والتحليلات العامة (Executive Dashboard)',
    titleEn: 'Executive Dashboard & Analytics',
    shortDescAr: 'المركز القيادي الرئيسي للمنظومة: رصد المؤشرات الحيوية لمخزون الصيدلية، ومعدلات الاستهلاك المالي والكمي، والتنبيهات المسبقة للإحالات الطبية، والمشاركة الفورية للتقارير.',
    shortDescEn: 'Central leadership dashboard monitoring live pharmaceutical inventory valuation, consumption trends, 24-hour advance refill notices, and instant report distribution.',
    categoryAr: 'الإدارة والمؤشرات',
    categoryEn: 'Management & KPIs',
    kpisAr: [
      'القيمة الإجمالية للمخزون الدوائي (Total Inventory Value) بالريال السعودي، محسوبة بدقة حسب أسعار الوحدات ورصيد كل صنف.',
      'إجمالي الأصناف الدوائية المسجلة والفعالة في مستودع الصيدلية.',
      'إجمالي الجرعات والكميات المصروفة تراكمياً لجميع مستفيدي المركز المستفيدين.',
      'تعداد الأدوية قريبة انتهاء الصلاحية (خلال 90 يوماً افتراضياً) للتصرف السريع وتفادي الهدر.',
      'تعداد الأدوية منتهية الصلاحية الفعلية الواجب سحبها فوراً، والأدوية ذات الرصيد الحرج (15 وحدة أو أقل).'
    ],
    kpisEn: [
      'Total pharmaceutical stock valuation in SAR calculated by unit prices and actual balances.',
      'Total registered and active medication items cataloged in the warehouse.',
      'Cumulative volume of doses and medication units dispensed to resident beneficiaries.',
      'Items approaching expiry threshold (default 90 days) requiring priority dispensing.',
      'Expired items needing immediate quarantine, alongside critical stock alerts (15 units or less).'
    ],
    featuresAr: [
      {
        title: 'بطاقات التقييم الفوري والمؤشرات اللونية (Scorecards)',
        desc: 'أربع بطاقات قيادية ملونة تعكس الواقع المالي واللوجستي للصيدلية: المخزون الكلي، الأدوية السليمة، قريبة الانتهاء، والحرجة مع إرشادات المعالجة.'
      },
      {
        title: 'نظام تنبيهات الإحالات الطبية المسبقة (قبل الموعد بـ 24 ساعة) 🔔',
        desc: 'نظام مراقبة استباقي يحلل مواعيد إحالات المستفيدين للعيادات والمستشفيات الخارجية، ويطلق تنبيهاً وقائياً بارزاً قبل الموعد بيوم كامل لتجهيز الأدوية المصاحبة والفريق المرافق.'
      },
      {
        title: 'المشاركة الفورية لتقرير الرقابة الدوائية عبر WhatsApp 📲',
        desc: 'نافذة مشاركة سريعة تولد ملخصاً رسمياً لأرصدة الأدوية ومؤشرات الصلاحية مدعوماً بروابط مباشرة لتنزيل ملفات الـ PDF الرسمية المعتمدة باللغتين العربية والإنجليزية.'
      },
      {
        title: 'الرسم البياني الزمني للاستهلاك والتوزيع العلاجي',
        desc: 'مخطط تحليلي تفاعلي يوضح حجم وقيمة الصرف عبر الأشهر، ومخطط دائري يوضح نسب الفئات العلاجية (نفسية، عصبية، مسكنات، أمراض مزمنة).'
      },
      {
        title: 'أزرار الوصول السريع والعمليات الفورية',
        desc: 'أزرار مباشرة لبدء "صرف دواء جديد" فوراً، أو "طباعة تقرير جرد المخازن" الرسمي المنسق للتوقيع الإداري بضغطة زر واحدة.'
      }
    ],
    featuresEn: [
      {
        title: 'Instant Metric Scorecards & Color Status',
        desc: 'Color-coded KPI cards presenting inventory valuation, registered items, near-expiry alerts, and critical stock status.'
      },
      {
        title: '24-Hour Advance Medical Referral Alarms 🔔',
        desc: 'Proactive monitor flagging residents scheduled for external hospital clinics 24 hours in advance to ready escort medications.'
      },
      {
        title: 'Instant WhatsApp Medication Dispatches 📲',
        desc: 'Quick dispatch tool generating formatted pharmacy summaries bundled with direct server links to official Arabic and English PDFs.'
      },
      {
        title: 'Monthly Expenditure & Therapeutic Breakdown Charts',
        desc: 'Interactive bar charts tracking monthly spending and donut charts illustrating psychiatric, analgesic, and chronic drug allocations.'
      },
      {
        title: 'Rapid Action Triggers',
        desc: 'Direct shortcuts to initiate instant dispensing or trigger official signed inventory stocktaking printouts.'
      }
    ],
    stepsAr: [
      'فور تسجيل الدخول، تفتح لوحة التحكم تلقائياً وتفحص مؤشرات الأدوية والمخاطر.',
      'راجع شريط التنبيهات العلوي: إذا وُجدت أدوية منتهية الصلاحية أو إحالات طبية مستحقة غداً، ستظهر لافتة تحذيرية حمراء أو برتقالية.',
      'انقر زر "صرف دواء جديد" للقفز مباشرة إلى شاشة الصرف السريع دون تضييع الوقت.',
      'انقر على "تقرير الرقابة عبر واتساب 📲" لمشاركة الإحصائيات مع الإدارة الطبية عبر رقم الهاتف المسجل.',
      'انقر زر "طباعة تقرير جرد المخازن" للحصول على وثيقة جرد رسمية معتمدة جاهزة للطباعة والتوقيع.'
    ],
    stepsEn: [
      'Upon sign-in, the executive dashboard automatically renders live KPIs and critical safety alerts.',
      'Inspect top notification bars for expired medicines, low stock levels, or residents with hospital appointments tomorrow.',
      'Click "New Dispense" to navigate straight to the clinical dispensing screen without delay.',
      'Click "WhatsApp Report 📲" to dispatch summary metrics and download links to medical leadership.',
      'Click "Print Inventory Stocktaking" to produce an official verified warehouse sheet for signature.'
    ],
    tipsAr: [
      'اضغط على بطاقة "الأدوية قريبة الانتهاء" للانتقال السريع إلى المخزون وتصفية الأصناف التي تنتهي قريباً لصرفها أولاً.',
      'استخدم تقرير الواتساب صباح كل يوم لإبقاء إدارة المركز على اطلاع دائم بجاهزية المستودع الدوائي.'
    ],
    tipsEn: [
      'Click the Near Expiry card to jump directly to filtered inventory items requiring priority rotation.',
      'Dispatch the WhatsApp summary daily to maintain continuous visibility with healthcare directors.'
    ]
  },
  {
    id: 'inventory',
    icon: '📦',
    titleAr: 'إدارة المخزون والمستودع الدوائي (Drug Inventory & Stock)',
    titleEn: 'Drug Inventory & Stock Management',
    shortDescAr: 'الإدارة الكاملة لمستودع الأدوية: إضافة الأصناف بالاسمين التجاريين (عربي وإنجليزي)، المادة الفعالة، التصنيف، التشغيلات، الأسعار، حساب الصلاحية آلياً، والفرز والتصدير.',
    shortDescEn: 'Comprehensive warehouse management: bilingual brand names, active ingredients, therapeutic categories, batch tracking, unit pricing, automated shelf-life scoring, sorting, and exports.',
    categoryAr: 'المستودع والإمداد',
    categoryEn: 'Supply & Warehouse',
    kpisAr: [
      'الاسم التجاري بالعربية والاسم التجاري بالإنجليزية لكل صنف دوائي لضمان المطابقة الدقيقة.',
      'الاسم العلمي والمادة الفعالة (Active Ingredient / Generic Name) المعتمدة.',
      'التصنيف العلاجي الدوائي (أدوية نفسية، مسكنات، مضادات حيوية، جهاز هضمي، أدوية غدد وأمراض مزمنة).',
      'حالة الصلاحية الذكية: تمييز لوني ثلاثي (أخضر: سليم، أصفر: يوشك على الانتهاء، أحمر: منتهي الصلاحية).',
      'الرصيد الفعلي المتوفر، وحدة الصرف (علبة، شريط، قرص، مل، أمبول)، سعر الوحدة، والقيمة السعرية الإجمالية.'
    ],
    kpisEn: [
      'Bilingual trade names (Arabic and English) ensuring zero transcription errors.',
      'Active chemical ingredient and scientific generic nomenclature.',
      'Therapeutic class breakdown (Psychiatric, Neurological, Analgesic, Gastrointestinal, Endocrine).',
      'Three-state shelf-life telemetry: Green (Safe), Yellow (Expiring within threshold), Red (Expired).',
      'Physical stock units, dispensing measures (Box, Strip, Tablet, mL, Ampoule), unit cost, and extended value.'
    ],
    featuresAr: [
      {
        title: 'محرك بحث متقدم وفلترة متعددة المعايير',
        desc: 'بحث لحظي فوري بالاسم التجاري العربي، الاسم الإنجليزي، المادة الفعالة، الشركة المصنعة، أو الفئة، مع فلاتر سريعة لحالات الصلاحية (الكل، سليم، يوشك على الانتهاء، منتهي الصلاحية).'
      },
      {
        title: 'أدوات فرز وترتيب الأصناف (Sorting)',
        desc: 'إمكانية فرز جدول المخزون فورياً بنقرة واحدة: فرز أبجدي حسب الاسم التجاري (أ-ي)، أو تاريخ انتهاء الصلاحية الأقرب، أو الرصيد الأقل، أو السعر.'
      },
      {
        title: 'نموذج إضافة دواء جديد متكامل ودقيق',
        desc: 'نموذج إدخال منظم يشمل: الاسمين التجاريين، المادة الفعالة، التصنيف العلاجي، الشركة المصنعة، رقم التشغيلة، السعر، الكمية، والوحدة مع فحص ذكي للتواريخ.'
      },
      {
        title: 'التعديل السريع مع التوثيق التراكمي',
        desc: 'إمكانية تعديل بيانات أي صنف في أي وقت، مع توثيق التعديل تلقائياً في سجل التدقيق لضمان الشفافية والمسؤولية.'
      },
      {
        title: 'تصدير المخزون إلى Excel / CSV وطباعة الجرد الميداني',
        desc: 'تصدير كشف المستودع بالكامل إلى ملف جداول بيانات Excel بنقرة واحدة، أو طباعة تقرير الجرد الميداني الرسمي المعتمد للتفتيش.'
      }
    ],
    featuresEn: [
      {
        title: 'Multi-Criteria Live Search & Filtering',
        desc: 'Instant query engine covering Arabic/English trade names, generic substance, manufacturer, and category, paired with shelf-life status filters.'
      },
      {
        title: 'Dynamic Column Sorting',
        desc: 'One-click sorting across brand name alphabetically (A-Z), closest expiration date, lowest quantity, or unit price.'
      },
      {
        title: 'Comprehensive Medication Onboarding Form',
        desc: 'Structured entry form capturing bilingual names, active substance, category, manufacturer, batch number, unit price, and quantities.'
      },
      {
        title: 'Secure Item Editing & Audit Logging',
        desc: 'Seamless updates to medication specifications automatically preserved in the immutable audit trail.'
      },
      {
        title: 'Excel / CSV Spreadsheet Export & Official Printout',
        desc: 'One-click export of complete stock ledger to Excel or generation of formal field inventory audit documents.'
      }
    ],
    stepsAr: [
      'انقر زر "+ إضافة دواء جديد" أعلى جدول المخزون لفتح نموذج الإدخال.',
      'أدخل الاسم التجاري باللغة العربية والاسم التجاري باللغة الإنجليزية بدقة.',
      'اكتب المادة الفعالة (الاسم العلمي) وحدد التصنيف العلاجي والشركة المصنعة.',
      'حدد الكمية المستلمة، وحدة الصرف (قرص، علبة...)، سعر الوحدة بالريال، وتاريخ انتهاء الصلاحية.',
      'اضغط "حفظ الدواء" لإدراجه فوراً في المستودع وقاعدة البيانات مع إشعار نجاح فوري.',
      'لتعديل أي صنف، انقر أيقونة التعديل (✏️) في صف الدواء بالجدول، وعدل الحقول ثم احفظ.',
      'لتصدير البيانات، اضغط زر "تصدير إلى Excel 📥"، أو اضغط "طباعة الجرد 🖨️" لاستخراج النموذج المعتمد.'
    ],
    stepsEn: [
      'Click "+ Add New Medication" above the table to launch registration form.',
      'Enter Arabic and English trade names accurately to avoid misidentification.',
      'Enter active chemical substance, select therapeutic class, and choose manufacturer.',
      'Set received units, dispensing measure, unit cost in SAR, and valid expiration date.',
      'Click "Save Medication" to commit the item to warehouse database with instant confirmation toast.',
      'To update an item, click the pencil icon (✏️) in the table row, apply edits, and save.',
      'To export records, click "Export to Excel 📥" or "Print Inventory 🖨️" for formal audit sheets.'
    ],
    tipsAr: [
      'احرص دائماً على كتابة المادة الفعالة بدقة، لأن نظام فحص تعارض الحساسية في شاشة الصرف يعتمد عليها كلياً لحماية حياة المستفيد.',
      'استخدم فلتر "منتهية الصلاحية" أسبوعياً لعزل أي عبوة منتهية وإخراجها من الخدمة فوراً.'
    ],
    tipsEn: [
      'Always record the active ingredient accurately, as the automated allergy screening engine relies directly upon it during dispensing.',
      'Filter by Expired weekly to quarantine outdated products immediately in compliance with national health protocols.'
    ]
  },
  {
    id: 'dispense',
    icon: '💊',
    titleAr: 'الصرف الدوائي السريع والفحص السريري (Medication Dispense)',
    titleEn: 'Medication Dispense & Clinical Safety Intercepts',
    shortDescAr: 'شاشة الصرف اليومي للمستفيدين، مزودة بمربعات بحث ذكية عن النزيل والدواء، وأزرار الجرعات والكسور الدقيقة، وفحص آلي للحساسية وتعارض تكرار الجرعات.',
    shortDescEn: 'Daily clinical dispensing workflow with smart resident and medication search boxes, fractional dose quick selectors, automated allergy shields, and duplicate-dose prevention.',
    categoryAr: 'الصرف والتمريض',
    categoryEn: 'Dispense & Nursing',
    kpisAr: [
      'مربع بحث فوري وذكي عن المستفيد (بالاسم العربي، الاسم الإنجليزي، رقم الغرفة، أو رقم الهوية).',
      'عرض اسم المستفيد بالعربي وتحته اسمه بالإنجليزي، ورقم الغرفة والجناح والحساسيات المسجلة.',
      'مربع بحث فوري عن الدواء يعرض الاسم التجاري وتحته المادة الفعالة والرصيد الفعلي المتاح على الرف.',
      'أزرار الكسور السريعة (ربع حبة، نصف حبة، 0.2 حبة، 1 حبة، حبتين...) الموضعة بأناقة تحت مربع الاختيار لضمان دقة الجرعات.',
      'الاحتساب المالي التلقائي للتكلفة الإجمالية للصرف بناءً على سعر الوحدة والكمية المصروفة.',
      'توثيق اسم الصيدلي المنفذ والتاريخ بالساعة والدقيقة والثانية لكل حركة صرف.'
    ],
    kpisEn: [
      'Instant resident search filtering by Arabic name, English name, room number, or National ID.',
      'Resident confirmation card showing Arabic name, English name underneath, ward, room, and confirmed allergies.',
      'Medication search field displaying brand name, active substance underneath, and live shelf balance.',
      'Ergonomic fractional dosage buttons (1/4 tablet, 1/2 tablet, 0.2 tablet, 1 tablet, 2 tablets) positioned directly beneath the quantity selector for utmost clinical precision.',
      'Automated financial calculation of total dispensed cost based on unit price and quantity.',
      'Dispensing staff signature with precision timestamps logged into compliance records.'
    ],
    featuresAr: [
      {
        title: 'مربع البحث الذكي عن المستفيد المستفيد',
        desc: 'حقل بحث تفاعلي يفلتر المستفيدين بمجرد كتابة أول حرفين، مع بطاقة تأكيد أنيقة تعرض الاسم بالعربي والإنجليزي، الغرفة، والجناح وزر لإلغاء الاختيار.'
      },
      {
        title: 'مربع البحث الذكي عن الدواء والرصيد المتاح',
        desc: 'حقل بحث يظهر الاسم التجاري وتحته المادة الفعالة مع فحص فوري لرصيد الصيدلية لمنع صرف أصناف نافدة أو سالبة.'
      },
      {
        title: 'أزرار الكسور والجرعات السريعة المبتكرة',
        desc: 'أزرار مدمجة أسفل مربع الكمية تتيح اختيار الجرعات الدقيقة بلمسة واحدة: (ربع حبة: 0.25، نصف حبة: 0.5، اثنان من عشرة: 0.2، حبة واحدة: 1، حبتين: 2) لمنع أخطاء الإدخال اليدوي.'
      },
      {
        title: 'نظام الحماية من تكرار الصرف في نفس اليوم (Once-a-Day Shield)',
        desc: 'نظام أمان ذكي يفحص ما إذا كان المستفيد قد صُرف له نفس الدواء خلال نفس اليوم، ويُظهر تنبيهاً وقائياً لمنع إعطاء جرعات زائدة أو مضاعفة للمستفيد.'
      },
      {
        title: 'حاجز الحساسية الدوائية التلقائي الصارم (Allergy Intercept)',
        desc: 'فحص فوري يقارن المادة الفعالة للدواء بقائمة حساسيات المستفيد المسجلة؛ وفي حال وجود تعارض يظهر إشعار أحمر صارم ويمنع إتمام الصرف حمايةً للمريض.'
      },
      {
        title: 'تصفية سجلات الصرف وطباعة سند الصرف الفردي',
        desc: 'شريط أدوات متطور لتصفية سجل الصرف بين تاريخين محددين، والبحث بالوقت واسم الصيدلي، مع إمكانية طباعة سند صرف رسمي لكل عملية.'
      }
    ],
    featuresEn: [
      {
        title: 'Smart Beneficiary Resident Search Box',
        desc: 'Interactive search filtering residents instantly, paired with confirmed patient card displaying Arabic and English names, room, and clear button.'
      },
      {
        title: 'Live Medication Search & Shelf Balance Checker',
        desc: 'Search showing trade name and active ingredient underneath, verifying stock sufficiency in real time.'
      },
      {
        title: 'Innovative Fractional Tablet Dose Buttons',
        desc: 'Dedicated buttons beneath quantity selector allowing 1-click entry of 0.25 (1/4 tab), 0.5 (1/2 tab), 0.2 (2/10 tab), 1 tab, and 2 tabs.'
      },
      {
        title: 'Once-a-Day Duplicate Dose Protection',
        desc: 'Automated clinical safeguard alerting if the resident has already received this dose today, preventing accidental overdose.'
      },
      {
        title: 'Strict Automated Allergy Intercept',
        desc: 'Cross-checks active substance with resident allergy profile, halting transaction immediately if contradiction is detected.'
      },
      {
        title: 'Date-Range Filtering & Formal Dispense Receipts',
        desc: 'Filter dispense history between start and end dates, filter by pharmacist, and print individual stamped receipts.'
      }
    ],
    stepsAr: [
      'في مربع بحث المستفيد، اكتب جزءاً من اسم المستفيد أو رقم غرفته، ثم اختره من القائمة لتظهر بطاقته التعريفية.',
      'في مربع بحث الدواء، ابحث عن الدواء المطلوب؛ ستشاهد الاسم التجاري وتحته المادة الفعالة والرصيد الفعلي المتوفر.',
      'حدد كمية الصرف إما بكتابة الرقم أو بالضغط على أحد أزرار الكسور السريعة (ربع، نصف، 0.2، حبة، حبتين).',
      'تأكد من عدم ظهور تنبيه الحساسية الأحمر أو تنبيه تكرار الجرعة في نفس اليوم.',
      'تحقق من القيمة المالية المحسوبة آلياً، ثم اضغط زر "تأكيد واعتماد الصرف الدوائي 💊".',
      'يتم خصم الكمية فوراً من المستودع وتوثيق العملية في سجل الصرف، ويمكنك الضغط على زر الطباعة لاستخراج سند الصرف.'
    ],
    stepsEn: [
      'In resident search, type resident name or room number, then select to reveal confirmed patient card.',
      'In medication search, locate medicine; verify trade name, active substance underneath, and available shelf balance.',
      'Specify quantity by typing or clicking fractional buttons: 1/4 tab, 1/2 tab, 0.2 tab, 1 tab, or 2 tabs.',
      'Ensure neither an allergy intercept alert nor a duplicate-dose warning is triggered.',
      'Verify calculated transaction cost, then click "Confirm & Dispense Medication 💊".',
      'Inventory is decremented immediately, audit record is filed, and individual receipt can be printed.'
    ],
    tipsAr: [
      'إذا ظهر تنبيه الحساسية باللون الأحمر، توقف فوراً وتوجه إلى شاشة "البدائل الدوائية" لاختيار صنف بديل آمن معتمد.',
      'أزرار الكسور السريعة توفر دقة فائقة للأدوية النفسية والعصبية التي تتطلب جرعات دقيقة جداً مثل نصف أو ربع قرص.'
    ],
    tipsEn: [
      'If an allergy alert triggers, halt immediately and open Smart Alternatives to select a safe bioequivalent drug.',
      'Use fractional dose buttons to eliminate dosing errors for psychotropic medications requiring fractional titration.'
    ]
  },
  {
    id: 'residents',
    icon: '👥',
    titleAr: 'سجلات المستفيدين والإحالات الطبية وجدول الجرعات (Residents & 24h Dosing)',
    titleEn: 'Resident Health Records & 24h Dosage Schedules',
    shortDescAr: 'الملفات الطبية الشاملة لمستفيدي المركز: البيانات الشخصية، التشخيص، الحساسيات الدوائية، الفرز المتقدم، جدول الجرعات الـ 24 ساعة، وإدارة الإحالات الطبية للمستشفيات.',
    shortDescEn: 'Comprehensive resident health records with diagnoses, allergies, dynamic sorting, 24-hour daily dosage charts, and external hospital referral tracking.',
    categoryAr: 'السجلات الطبية',
    categoryEn: 'Medical Records',
    kpisAr: [
      'الرقم الطبي للمستفيد (MRN / Resident ID) ورقم الهوية الوطنية وتاريخ الميلاد والعمر.',
      'رقم الجناح ورقم الغرفة وفصيلة الدم والطبيب المعالج المشرف.',
      'قائمة الحساسيات الدوائية والغذائية المؤكدة التي يرتكز عليها نظام فحص الصرف.',
      'جدول الجرعات اليومية على مدار 24 ساعة (فترات الصباح، الظهيرة، والمساء) مع تعليمات البلع.',
      'الإحالات الطبية والمواعيد المستحقة للمستشفيات التخصصية والعيادات الخارجية وتواريخها المحددة.'
    ],
    kpisEn: [
      'Medical Record Number (MRN), National ID, birth date, and chronological age.',
      'Ward, room number, blood type, and attending supervising physician.',
      'Confirmed drug and food allergies strictly referenced by dispensing intercept algorithms.',
      'Daily 24-hour medication timetable (Morning, Noon, Evening) with swallowing directions.',
      'Active external specialist hospital appointments and clinical referral dates.'
    ],
    featuresAr: [
      {
        title: 'أدوات فرز وترتيب المستفيدين (Sorting)',
        desc: 'إمكانية فرز جدول المستفيدين فورياً بنقرة واحدة: فرز أبجدي حسب الاسم، أو تصاعدي حسب رقم الغرفة، أو حسب الجناح لتنظيم الجولات التمريضية.'
      },
      {
        title: 'جدول الجرعات اليومي الـ 24 ساعة (24h Daily Dosing Chart)',
        desc: 'برمجة مواعيد الأدوية اليومية لكل مستفيد على مدار الساعة (جرعات الصباح، الظهيرة، المساء) مع تحديد تعليمات الإعطاء وملاحظات عسر البلع (Dysphagia).'
      },
      {
        title: 'إدارة الإحالات والمواعيد الطبية وتنبيهات الـ 24 ساعة المسبقة',
        desc: 'تسجيل تاريخ الإحالة، المستشفى أو العيادة المحال إليها، وسبب الإحالة، مع إطلاق تنبيه تلقائي في النظام قبل الموعد بـ 24 ساعة كاملة لتجهيز الإجراءات والمرافقين.'
      },
      {
        title: 'الملف الطبي السريري الفردي المتكامل',
        desc: 'بطاقة موحدة تعرض التاريخ الطبي، الأدوية الموصوفة، الحساسيات، وسجل الملاحظات السلوكية.'
      },
      {
        title: 'طباعة الملف الطبي وجدول الجرعات المعتمد',
        desc: 'طباعة نموذج رسمي معتمد لملف المستفيد وجدول أدويته لتسليمه لكادر التمريض أو الفريق الطبي المرافق في الإحالة للمستشفى.'
      }
    ],
    featuresEn: [
      {
        title: 'Multi-Field Resident Table Sorting',
        desc: 'One-click sorting across resident list alphabetically by name, by room number, or by ward assignment.'
      },
      {
        title: '24-Hour Daily Dosage Regimen Chart',
        desc: 'Program daily medication times across morning, noon, and evening slots with administration directives and dysphagia notes.'
      },
      {
        title: 'Medical Referral Management with 24-Hour Prior Alarms',
        desc: 'Log referral dates, destination hospitals, and clinical objectives with automated 24-hour advance warning banners.'
      },
      {
        title: 'Integrated Resident Clinical Dossier',
        desc: 'Consolidated overview of medical diagnoses, active prescriptions, documented allergies, and behavioral histories.'
      },
      {
        title: 'Dossier & Dosing Chart Official Printout',
        desc: 'Print certified medical profiles and dosing schedules for nursing stations and hospital escort medical teams.'
      }
    ],
    stepsAr: [
      'انقر زر "+ إضافة مستفيد جديد" أو ابحث عن المستفيد بالاسم أو الغرفة في شريط البحث.',
      'أدخل البيانات الشخصية: الاسم بالعربية والإنجليزية، رقم الهوية، الغرفة، الجناح، وفصيلة الدم.',
      'سجل أي حساسيات دوائية أو غذائية مؤكدة يعاني منها المستفيد (خطوة حيوية لسلامته).',
      'في قسم "جدول الجرعات اليومية"، أضف الأدوية المقررة وحدد مواعيدها (صباح، ظهر، مساء) مع تعليمات التناول.',
      'إذا كان لدى المستفيد موعد في مستشفى خارجي، سجل "تاريخ الإحالة" والجهة الطبية وسبب الإحالة.',
      'لحفظ البيانات، اضغط "حفظ بيانات المستفيد"؛ ولطباعة ملفه، اضغط "طباعة الملف الطبي 🖨️".'
    ],
    stepsEn: [
      'Click "+ Add New Resident" or search existing resident by name or room number.',
      'Supply personal details: Arabic and English names, National ID, room, ward, and blood type.',
      'Record all confirmed drug or food allergies (vital for automated safety intercept checks).',
      'In "Daily Dosage Regimen", attach prescribed medicines and specify morning/noon/evening slots.',
      'If the resident has a hospital appointment, log the referral date, hospital name, and clinical purpose.',
      'Click "Save Resident Profile" to commit; click "Print Medical File 🖨️" to generate signed documentation.'
    ],
    tipsAr: [
      'استخدم فرز "رقم الغرفة" عند بدء جولة توزيع الأدوية التمريضية للمرور على الغرف بترتيب منتظم وتفادي تشتت الطاقم.',
      'راجع الإحالات الطبية المستحقة غداً في الصباح الباكر لتجهيز الأدوية المصاحبة وملف التحويل للمستشفى قبل خروج المستفيد.'
    ],
    tipsEn: [
      'Sort by Room Number prior to medication administration rounds for an efficient, systematic room-by-room distribution.',
      'Check tomorrow\'s hospital referrals every morning to package accompanying medications and transfer files in advance.'
    ]
  },
  {
    id: 'behavioral_tracker',
    icon: '🧠',
    titleAr: 'راصد السلوك والأعراض الجانبية (Behavioral & Side Effects Tracker)',
    titleEn: 'Behavioral Monitoring & Side Effects Tracker (BCMA)',
    shortDescAr: 'شاشة رصد متقدمة لتوثيق التغيرات السلوكية والنفسية ومتابعة تأثيرات الأدوية النفسية والعصبية، مزودة بمربع بحث ذكي وإدارة مخصصة للأعراض الجانبية وتوليد التحليل السريري.',
    shortDescEn: 'Advanced behavioral observation module tracking psychotropic side effects, equipped with live resident search, customizable adverse symptoms registry, and AI clinical dossier generation.',
    categoryAr: 'الرعاية السلوكية والنفسية',
    categoryEn: 'Behavioral Care',
    kpisAr: [
      'مربع بحث فوري وسريع عن المستفيد المستهدف بالاسم أو الغرفة مع بطاقة تأكيد أنيقة.',
      'التقييم والحالة السلوكية: مستقر 🟢، هياج حاد 🔴، قلق وتوتر 🟡، انسحاب وعزلة 🟣، فرط حركة 🔵.',
      'الدواء المشتبه به (Suspected Drug) المرتبط بظهور العارض السلوكي أو الجسدي.',
      'قائمة الأعراض الجانبية المرصودة مع إمكانية التخصيص الكامل (إضافة، تعديل، حذف أعراض).',
      'درجة خطورة وحدة العارض: بدون عوارض، طفيف، متوسط، شديد يستدعي تدخل الطبيب الفوري.'
    ],
    kpisEn: [
      'Instant resident search by name or room with confirmed selection badge.',
      'Behavioral classifications: Stable 🟢, Acute Agitation 🔴, Anxiety 🟡, Withdrawal 🟣, Hyperactivity 🔵.',
      'Suspected medication correlating with observed psychological or somatic reactions.',
      'Comprehensive adverse symptoms checklist with full user customization (add, edit, remove symptoms).',
      'Clinical severity grade: None, Mild, Moderate, or Severe requiring immediate physician consultation.'
    ],
    featuresAr: [
      {
        title: 'مربع البحث الفوري عن المستفيد المستهدف',
        desc: 'أداة بحث سريعة تتيح العثور على المستفيد فوراً وتصفية القائمة، مع بطاقة تأكيد أنيقة تعرض اسمه وغرفته وزر لإلغاء الاختيار.'
      },
      {
        title: 'إدارة وتخصيص الأعراض الجانبية (+ إضافة / تعديل / حذف)',
        desc: 'حرية كاملة لإضافة أعراض جديدة (مثل: طفح جلدي، خمول زائد، رعشة، دوخة، صعوبة بلع)، تعديل مسمياتها، أو حذفها مع حفظ دائم في النظام.'
      },
      {
        title: 'ربط الملاحظة بالدواء المشتبه به ومستوى الشدة',
        desc: 'تحديد الدواء النفسي أو العصبي المرتبط بالعرض السلوكي بدقة، مع تحديد مستوى الخطورة لفرز الحالات الحرجة.'
      },
      {
        title: 'توليد الدوسيه السريري الذكي بالذكاء الاصطناعي ✨',
        desc: 'تحليل التاريخ السلوكي والدوائي التراكمي للمستفيد وتوليد تقرير تشخيصي متقدم وتوصيات لضبط الخطة العلاجية والجرعات.'
      },
      {
        title: 'سجل الملاحظات التراكمي والطباعة الرسمية',
        desc: 'أرشيف زمني كامل لكافة الملاحظات السلوكية المسجلة مع إمكانية طباعتها لتقديمها للطبيب النفسي الاستشاري.'
      }
    ],
    featuresEn: [
      {
        title: 'Smart Target Resident Search Box',
        desc: 'Interactive search filtering residents instantly with verified selection card, room number, and clear option.'
      },
      {
        title: 'Customizable Adverse Symptoms Registry (+ Add / Edit / Delete)',
        desc: 'Complete administrative flexibility to register new side effects, edit names, or remove obsolete items with local persistence.'
      },
      {
        title: 'Suspect Medication Linkage & Severity Grading',
        desc: 'Direct correlation of observed behavioral deviations with suspected psychotropic drugs and severity grading.'
      },
      {
        title: 'AI Clinical Behavioral Dossier Generation ✨',
        desc: 'Synthesizes longitudinal behavioral notes and prescription logs into predictive clinical recommendations.'
      },
      {
        title: 'Historical Observation Ledger & Printouts',
        desc: 'Comprehensive chronological archive of nursing and psychiatric observations printable for consulting psychiatrists.'
      }
    ],
    stepsAr: [
      'انقر زر "تسجيل عارض جانبي جديد" أعلى الشاشة لفتح نموذج التدوين.',
      'في مربع البحث، اكتب اسم المستفيد أو رقم غرفته واختره من القائمة لتظهر بطاقته.',
      'اختر الحالة السلوكية للمستفيد (مستقر، هياج، قلق، انسحاب، حركة مفرطة).',
      'حدد الدواء المشتبه في تسببه في العارض من قائمة أدوية المستفيد.',
      'اختر الأعراض الجانبية من القائمة، أو انقر "+ إضافة عرض جديد" إذا كان العارض غير موجود بالقائمة.',
      'حدد مستوى الخطورة (طفيف، متوسط، شديد)، واكتب ملاحظاتك التمريضية بالتفصيل ثم اضغط "حفظ الملاحظة".',
      'لتوليد تقرير تحليلي متقدم، انقر زر "توليد الدوسيه السريري بالذكاء الاصطناعي ✨".'
    ],
    stepsEn: [
      'Click "Log New Side Effect Entry" to launch observation modal.',
      'In search box, type resident name or room number and select to confirm identity.',
      'Choose behavioral status: Stable, Agitated, Anxious, Withdrawn, or Hyperactive.',
      'Select suspected medication from resident prescribed drugs list.',
      'Check observed side effects, or click "+ Add New Side Effect" to append a custom symptom to the library.',
      'Set severity (Mild, Moderate, Severe), provide descriptive nursing notes, and click "Save Observation".',
      'To generate deep clinical insights, click "Generate AI Clinical Dossier ✨".'
    ],
    tipsAr: [
      'في حال كانت درجة الخطورة "شديدة"، يجب إشعار الطبيب المشرف فوراً للنظر في خفض الجرعة أو استبدال الدواء.',
      'تكرار رصد نفس العارض مع دواء معين يشير إلى عدم تحمل المستفيد للدواء ويجب توثيقه في ملفه الطبي الدائم.'
    ],
    tipsEn: [
      'Any reaction classified as Severe requires urgent escalation to the medical director for dose tapering or substitution.',
      'Recurrent side effects tied to a specific psychotropic compound indicate drug intolerance and must be recorded in the permanent dossier.'
    ]
  },
  {
    id: 'stock_audit',
    icon: '🔄',
    titleAr: 'التسوية المخزنية والتدقيق الميداني (Stock Audit & Adjustment)',
    titleEn: 'Stock Audit & Inventory Reconciliation',
    shortDescAr: 'أداة ضبط الرصيد المخزني والمطابقة الميدانية الدورية، مزودة بمربع بحث فوري عن الدواء المعني، وتوثيق تسويات العجز والإتلاف والإضافة مع سجل تدقيق إلزامي دائم.',
    shortDescEn: 'Perpetual stock adjustment and reconciliation engine featuring live medicine search, addition/deficit logging, and mandatory immutable audit trails.',
    categoryAr: 'الرقابة والجودة',
    categoryEn: 'Compliance & Audit',
    kpisAr: [
      'مربع بحث فوري وذكي عن "الدواء المعني بالطبيعة" بالاسم التجاري والعلمي والفئة والمصنع.',
      'عرض فوري للرصيد الفعلي الحالي في الرف مع تمييز لوني للأرصدة الحرجة (15 وحدة أو أقل).',
      'نوع التسوية المخزنية: خصم وعجز وإتلاف ومفقود (-) أو إضافة واستلام وتعديل جرد (+).',
      'الكمية المعدلة وحقل سبب وملاحظات التدقيق الإلزامي لضمان النزاهة والمساءلة.',
      'سجل اللوغ التراكمي الدائم للتسويات اليدوية مع اسم الموظف والتوقيت الدقيق بالثانية.'
    ],
    kpisEn: [
      'Smart live search for target medication across trade name, generic substance, and manufacturer.',
      'Real-time physical shelf balance card with color-coded critical alerts (<= 15 units).',
      'Adjustment types: Deficit / Damage / Loss (-) or Stock Addition / Reconciliation (+).',
      'Adjusted units with mandatory audit justification field enforcing clinical transparency.',
      'Permanent immutable audit ledger capturing executing staff name and exact second timestamps.'
    ],
    featuresAr: [
      {
        title: 'مربع البحث الذكي عن الدواء المعني بالطبيعة',
        desc: 'حقل بحث فوري يفلتر الأدوية بمجرد الكتابة، مع إظهار بطاقة تعريفية بالدواء المختار ورصيده الفعلي الحالي في الرف وزر لإلغاء الاختيار.'
      },
      {
        title: 'التسوية المزدوجة (خصم أو إضافة)',
        desc: 'إمكانية إثبات عجز أو إتلاف لمعالجة النواقص، أو إضافة كميات جديدة ناتجة عن تصحيح جرد ميداني أو توريد استثنائي.'
      },
      {
        title: 'إلزامية كتابة سبب التسوية (ملاحظات التدقيق)',
        desc: 'حماية نظامية صارمة تمنع حفظ أي تسوية بدون تدوين سبب واضح ومعتمد كمرجع للجان التفتيش والرقابة.'
      },
      {
        title: 'سجل حركات التسوية التراكمي (Audit Trail Ledger)',
        desc: 'جدول دائم يوثق كل حركة تسوية سابقة: اسم الدواء، النوع، الكمية المعدلة، الموظف المسؤول، والسبب المدون.'
      }
    ],
    featuresEn: [
      {
        title: 'Target Medicine Live Search Box',
        desc: 'Interactive search filtering medications with selected item card, current balance badge, and clear button.'
      },
      {
        title: 'Dual Reconciliation (Addition or Deduction)',
        desc: 'Record deficits, breakages, and expired discards (-) or increment shelf balances resulting from physical counts (+).'
      },
      {
        title: 'Mandatory Audit Rationale Policy',
        desc: 'Systemic policy strictly blocking any adjustment saved without an authorized justification.'
      },
      {
        title: 'Permanent Stock Adjustment Ledger',
        desc: 'Detailed chronological ledger logging medication, delta quantity, executing staff, and justification notes.'
      }
    ],
    stepsAr: [
      'في حقل "الدواء المعني بالطبيعة"، اكتب اسم الدواء أو اسمه العلمي في مربع البحث.',
      'اختر الدواء من القائمة المفلترة لتظهر بطاقته موضحة رصيده الفعلي الحالي في المستودع.',
      'حدد "نوع التسوية": اختر (عجز / إتلاف / مفقود -) للخصم، أو (إضافة / تصحيح رصيد +) للزيادة.',
      'أدخل "الكمية المعدلة" بدقة.',
      'اكتب سبب التسوية بالتفصيل في حقل "سبب وملاحظات التدقيق" (حقل إلزامي لا يقبل النظام الحفظ بدونه).',
      'اضغط زر "حفظ التسوية وتحديث الرصيد"؛ يُحدث الرصيد فوراً ويُدرج الحدث في سجل التدقيق الدائم.'
    ],
    stepsEn: [
      'In target medication search, type trade or generic name to find the item.',
      'Select medication from dropdown to inspect real-time physical shelf balance.',
      'Choose adjustment direction: Deficit / Damage / Discard (-) or Addition / Physical Adjustment (+).',
      'Enter the adjustment quantity accurately.',
      'Provide comprehensive rationale in mandatory Audit Justification field (system blocks saving if blank).',
      'Click "Save Adjustment & Update Balance"; stock updates instantly and entry is locked into audit ledger.'
    ],
    tipsAr: [
      'عمليات التسوية المخزنية تسجل في اللوغ الأمني الدائم وتعتبر مستنداً رسمياً في تقارير الجرد السنوية أمام هيئات الرقابة.',
      'في حال اكتشاف عبوة مكسورة أو متغيرة الخواص، استخدم نوع التسوية (إتلاف) مع كتابة رقم التشغيلة في الملاحظات.'
    ],
    tipsEn: [
      'All adjustments are permanently sealed into the audit trail and submitted during official health regulatory inspections.',
      'When logging damaged or compromised vials, select Damage (-) and include the batch number in audit notes.'
    ]
  },
  {
    id: 'alternatives',
    icon: '🔍',
    titleAr: 'البدائل الدوائية الذكية ودليل الشركات (Alternatives & Manufacturers)',
    titleEn: 'Smart Medication Alternatives & Manufacturer Directory',
    shortDescAr: 'محرك بحث متقدم عن البدائل العلاجية المتطابقة حيوياً وعلمياً في حال نفاذ صنف معين، مع مقارنة الأسعار والأرصدة، وزر الصرف المباشر، ودليل شركات الأدوية المعتمدة.',
    shortDescEn: 'Bioequivalent alternative search engine for out-of-stock items, price/balance comparisons, one-click dispense routing, and comprehensive pharmaceutical manufacturer directory.',
    categoryAr: 'الصيدلة السريرية',
    categoryEn: 'Clinical Pharmacy',
    kpisAr: [
      'مطابقة المادة الفعالة والتركيز (Generic Bioequivalence) لضمان نفس الفاعلية العلاجية.',
      'حالة توفر البديل ورصيده الفعلي الحالي في مخزن الصيدلية.',
      'فرق السعر بين الصنف الأصلي والبدائل المقترحة لمساعدة الإدارة في الترشيد المالي.',
      'دليل شركات ومصانع الأدوية المعتمدة محلياً ودولياً، بلد المنشأ، الهاتف، والبريد الإلكتروني.'
    ],
    kpisEn: [
      'Generic active substance and concentration bioequivalence ensuring clinical parity.',
      'Warehouse stock balance and physical availability of candidate substitutes.',
      'Unit price differentials between originator and candidate generic substitutes.',
      'Directory of verified local and international manufacturers, countries of origin, phone numbers, and support emails.'
    ],
    featuresAr: [
      {
        title: 'محرك اقتراح البدائل الذكي',
        desc: 'اقتراح فوري للأدوية المتوفرة فعلياً في المستودع والتي تشترك في نفس المادة الفعالة والمجموعة العلاجية عند نفاذ الصنف المطلوب.'
      },
      {
        title: 'المقارنة الفورية للأسعار والأرصدة',
        desc: 'بطاقات مقارنة تعرض الرصيد المتبقي وسعر الوحدة والشركة المصنعة لكل بديل مقترح لسرعة اتخاذ القرار.'
      },
      {
        title: 'زر صرف البديل المباشر (One-Click Dispense)',
        desc: 'الانتقال بضغطة زر واحدة إلى شاشة الصرف مع تعبئة بيانات الدواء البديل تلقائياً لتسريع الخدمة.'
      },
      {
        title: 'دليل شركات ومصانع الأدوية المعتمدة',
        desc: 'سجل متكامل للشركات المصنعة مع أرقام الهواتف وعناوين الدعم الفني وتصدير الدليل بملف منظم.'
      }
    ],
    featuresEn: [
      {
        title: 'Bioequivalent Smart Recommendation Engine',
        desc: 'Recommends available warehouse substitutes sharing identical active substances and therapeutic classifications.'
      },
      {
        title: 'Instant Price & Shelf Balance Comparison',
        desc: 'Comparative cards displaying remaining shelf balance, unit cost, and manufacturer for every candidate substitute.'
      },
      {
        title: 'One-Click Alternative Dispense Transition',
        desc: 'Single click routes directly into the dispensing screen with pre-populated alternative medication data.'
      },
      {
        title: 'Approved Pharmaceutical Manufacturers Directory',
        desc: 'Complete directory of local and global drug makers with contact channels, country of origin, and export options.'
      }
    ],
    stepsAr: [
      'في مربع البحث، اكتب اسم الدواء الأصلي غير المتوفر أو المطلوب البحث عن بدائل له.',
      'استعرض بطاقات البدائل المتطابقة حيوياً وتأكد من توفر رصيد كافٍ على الرف.',
      'قارن بين الأسعار والشركات المصنعة لاختيار البديل الأنسب.',
      'اضغط زر "صرف هذا البديل 💊" للانتقال فوراً لشاشة الصرف ومتابعة صرفه للمستفيد.',
      'لاستعراض بيانات المصانع، انتقل لتبويب "دليل الشركات المصنعة" وابحث بالاسم أو الدولة.'
    ],
    stepsEn: [
      'In search box, type out-of-stock medication name to query candidate bioequivalents.',
      'Review matching alternative cards and confirm sufficient stock balance on shelves.',
      'Compare unit prices and manufacturers to choose the optimal clinical option.',
      'Click "Dispense This Alternative 💊" to load item directly into clinical dispensing flow.',
      'To review manufacturer contacts, switch to "Manufacturers Directory" tab.'
    ],
    tipsAr: [
      'تأكد دائماً من ملاءمة الشكل الصيدلاني للبديل (أقراص مقابل شراب) لظروف المستفيد، خصوصاً لمن يعانون من صعوبة البلع.',
      'احرص على إشعار الطبيب المعالج عند صرف بديل دوائي ذو تركيز مختلف لضبط الجرعة المقررة.'
    ],
    tipsEn: [
      'Always ensure candidate alternative formulation (oral suspension vs. tablets) fits resident swallowing capability.',
      'Consult the attending physician when substituting with a different concentration to adjust the administered dose.'
    ]
  },
  {
    id: 'ai_reports',
    icon: '✨',
    titleAr: 'التقارير الرقابية الرسمية والذكاء الاصطناعي (AI & Regulatory Reports)',
    titleEn: 'Official Regulatory Reports & Clinical AI Intelligence',
    shortDescAr: 'منظومة إصدار التقارير الرقابية والسريرية المعتمدة: تقارير الرقابة الدوائية الشاملة باسم المركز، تنزيل وتصدير ملفات PDF الرسمية عبر السيرفر، وتقييم التداخلات الدوائية بالذكاء الاصطناعي.',
    shortDescEn: 'Certified clinical and regulatory reporting system generating official Shaqra Center PDF reports, WhatsApp dispatches, and predictive AI polypharmacy assessments.',
    categoryAr: 'التقارير والذكاء الاصطناعي',
    categoryEn: 'Reports & Clinical AI',
    kpisAr: [
      'تقرير الرقابة الدوائية الشامل الصادر عن صيدلية مركز التأهيل الشامل للذكور بشقراء.',
      'روابط تنزيل ملفات PDF الرسمية المعتمدة بالعربية والإنجليزية مباشرة من خوادم النظام بجودة فائقة.',
      'تحليل وتقييم مخاطر التداخلات والازدواجية الدوائية المتعددة (Polypharmacy Risk Assessment).',
      'مؤشرات الأدوية منتهية الصلاحية، قريبة الانتهاء، وحد المخزون الحرج بالأرقام الدقيقة.'
    ],
    kpisEn: [
      'Official Comprehensive Drug Safety & Regulatory Report for Shaqra Rehabilitation Center.',
      'Direct server URLs for verified Arabic and English PDF document downloads.',
      'Predictive polypharmacy risk index and drug-drug interaction evaluations.',
      'Exact warehouse counts of expired items, near-expiry alerts, and critical deficit items.'
    ],
    featuresAr: [
      {
        title: 'توليد ملفات PDF الرسمية المعتمدة عبر السيرفر',
        desc: 'محرك سيرفر مخصص يولد ملفات PDF احترافية متوافقة مع الطباعة الرسمية متضمنة ترويسة المركز وختم الصيدلية بالعربية والإنجليزية بدقة متناهية.'
      },
      {
        title: 'تقييم التداخلات الدوائية بالذكاء الاصطناعي (Polypharmacy)',
        desc: 'تحليل التاريخ الدوائي للمستفيدين، كشف التفاعلات الخفية بين الأدوية النفسية والجسدية، وتقديم توصيات للأطباء لضبط الجرعات وتجنب التعارضات.'
      },
      {
        title: 'المشاركة الفورية لتقارير الأدوية عبر WhatsApp',
        desc: 'إرسال ملخصات الرقابة الدوائية الفورية مع روابط تنزيل مستندات الـ PDF للمسؤولين والأطباء بضغطة زر واحدة.'
      },
      {
        title: 'التقرير السريري التنبؤي لكل مستفيد',
        desc: 'إمكانية اختيار أي مستفيد وتوليد تقرير تشخيصي شامل لحالته الصحية ومدى استجابته للأدوية وتأثيراتها الجانبية.'
      }
    ],
    featuresEn: [
      {
        title: 'Server-Side Certified PDF Generation',
        desc: 'Dedicated backend service delivering compliant PDF reports with official center headers, seals, and formatting.'
      },
      {
        title: 'AI Polypharmacy & Drug Conflict Assessment',
        desc: 'Evaluates drug histories, flags hidden interactions between psychotropics and somatic medicines, and suggests dose adjustments.'
      },
      {
        title: 'Instant WhatsApp Medication Dispatches',
        desc: 'Send formatted summaries with verified PDF download links directly to stakeholders.'
      },
      {
        title: 'Individual Resident Predictive Clinical Report',
        desc: 'Generate comprehensive patient dossier assessing overall therapy efficacy and longitudinal side effect trends.'
      }
    ],
    stepsAr: [
      'انقر زر "تصدير / تنزيل PDF بالعربية" أو "English PDF" لتحميل التقرير الرسمي مباشرةً من السيرفر.',
      'لتوليد تقرير سريري لمستفيد معين، اختر المستفيد من القائمة ثم اضغط "توليد التقرير السريري بالذكاء الاصطناعي ✨".',
      'راجع قسم تقييم التداخلات الدوائية وملاحظات السلامة السريرية المقترحة.',
      'لمشاركة التقرير عبر واتساب، افتح نافذة الواتساب واضغط "إرسال عبر WhatsApp 📲".'
    ],
    stepsEn: [
      'Click "Export Arabic PDF" or "English PDF" to download official reports directly.',
      'To run AI clinical assessment for a resident, select patient and click "Generate AI Clinical Report ✨".',
      'Review polypharmacy evaluations, safety observations, and suggested dosage tweaks.',
      'To dispatch via WhatsApp, open modal and click "Send via WhatsApp 📲".'
    ],
    tipsAr: [
      'تعتبر تقارير الذكاء الاصطناعي أداة مساندة استرشادية، ويظل القرار النهائي للفريق الطبي المعالج بالمركز.',
      'احفظ نسخاً شهرية من تقارير PDF الصادرة في الأرشيف الإداري كمرجع رسمي للرقابة الصحية.'
    ],
    tipsEn: [
      'AI assessments are consultative decision-support aids; clinical modifications require attending physician approval.',
      'Archive monthly PDF reports in central administrative files as permanent official compliance records.'
    ]
  },
  {
    id: 'statistics',
    icon: '📈',
    titleAr: 'الإحصائيات العامة ومؤشرات الأداء الميداني (Live System Statistics)',
    titleEn: 'Live System Statistics & Performance Metrics',
    shortDescAr: 'شاشة قياس وتحليل مخصصة لمدير النظام والصيادلة: رصد فوري لأعداد المستفيدين، توزيع الأجنحة، الكادر الوظيفي، أرصدة الأدوية الحية، وحدات القياس، والرسوم البيانية التفاعلية والتصدير.',
    shortDescEn: 'Live operational metrics dashboard for Administrators and Pharmacists tracking resident demographics, staff role distribution, active medicine stock, measurement units, and Excel exports.',
    categoryAr: 'الإحصائيات والتحليل',
    categoryEn: 'Analytics & Governance',
    kpisAr: [
      'إحصائيات أعداد المستفيدين (العدد الكلي، نسب التوزيع حسب الأجنحة والغرف، المواعيد المستحقة، ومتوسط الأعمار).',
      'إحصائيات الكادر الوظيفي وتوزيع الحسابات (مدراء النظام، الصيادلة، فنيو الصيدلة، والمشاهدون).',
      'إحصائيات الأدوية والمخزون الحي (الأصناف المسجلة، الرصيد الإجمالي، الأدوية الحرجة، النافدة، ومنتهية الصلاحية).',
      'إحصائيات وحدات القياس والفئات العلاجية ونسبة الربط الفعلي بأصناف المستودع.',
      'تصدير فوري للتقرير الإحصائي بصيغة Excel / CSV مع إمكانية الطباعة الرسمية المنسقة.'
    ],
    kpisEn: [
      'Resident demographics: total count, ward/room distribution, upcoming medical appointments, and age averages.',
      'Staff user distribution across roles (Administrators, Pharmacists, Technicians, Viewers).',
      'Live medicine inventory telemetry: registered medicines, warehouse units, out-of-stock, and low-stock alerts.',
      'Measurement units and therapeutic classes utilization and assignment rates.',
      'One-click export of comprehensive metrics to CSV/Excel and formatted print layout.'
    ],
    featuresAr: [
      {
        title: 'الرصد الخماسي الأساسي (الأعداد الحية)',
        desc: 'عرض بطاقات إحصائية تفاعلية للأعداد الخمسة الجوهرية: المستفيدين، المستخدمين، الأدوية، الوحدات، والفئات العلاجية مع مؤشرات فرعية دقيقة.'
      },
      {
        title: 'الرسوم البيانية التفاعلية لحالة المخزون والفئات',
        desc: 'مخططات بيانية فورية توضح توزيع الأدوية بحسب الفئات العلاجية ونسبة صحة المخزون الدوائي (متوفر، منخفض، نافد).'
      },
      {
        title: 'كشف تفصيلي بالوحدات والفئات العلاجية',
        desc: 'جداول تفاعلية تستعرض كافة وحدات القياس والفئات العلاجية مع عدد الأصناف المرتبطة بكل منها لضمان خلو الداتابيز من الفئات اليتيمة.'
      },
      {
        title: 'تصدير التقارير الإحصائية إلى Excel والطباعة المنسقة',
        desc: 'أزرار مخصصة لتنزيل كشف إحصائي كامل بملف Excel / CSV أو استخراج نسخة ورقية مطبوعة للاجتماعات الإدارية.'
      }
    ],
    featuresEn: [
      {
        title: 'Core 5 Entity Real-Time Counters',
        desc: 'High-contrast summary cards for Residents, Users, Medicines, Units, and Therapeutic Classes.'
      },
      {
        title: 'Interactive Inventory & Category Charts',
        desc: 'Visual bar and donut charts illustrating category density and inventory health ratios.'
      },
      {
        title: 'Detailed Units & Categories Breakdown',
        desc: 'Tabular views displaying linked medicine counts per measurement unit and therapeutic category.'
      },
      {
        title: 'Excel / CSV Export & Formatted Printout',
        desc: 'Instant export of comprehensive ledger data to spreadsheet formats or official printable layout.'
      }
    ],
    stepsAr: [
      'انقر على شاشة "إحصائيات 📈" في شريط التنقل العلوي للوصول إلى لوحة الأرقام الحية.',
      'استعرض البطاقات الخمس الرئيسية في الأعلى للاطلاع على الأعداد الإجمالية.',
      'استخدم التبويبات الفرعية للتبديل بين الرسوم البيانية، تفاصيل الوحدات والفئات، كشف الأدوية، وتوزيع المستفيدين.',
      'انقر زر "تصدير CSV / Excel 📥" لتنزيل تقرير إحصائي متكامل لتقديمه للإدارة.',
      'انقر زر "طباعة التقرير الإحصائي 🖨️" لاستخراج نسخة رسمية منسقة للتوثيق الميداني.'
    ],
    stepsEn: [
      'Click the "Statistics 📈" tab in top navigation to open live metrics dashboard.',
      'Review the five primary metric cards at the top for overall entity counts.',
      'Switch between sub-tabs to view charts, units/categories breakdowns, medicine audits, and demographics.',
      'Click "Export CSV / Excel 📥" to download a complete statistical ledger.',
      'Click "Print Statistics 🖨️" for an official signed operational report.'
    ],
    tipsAr: [
      'تفيد شاشة الإحصائيات في تقدير الميزانية الدوائية الشهرية ومراقبة نسب إشغال الأجنحة والغرف وتحديد الأصناف الأكثر طلباً.',
      'متاح لمدير النظام والصيادلة لمتابعة خطط العمل اليومية والتأكد من توازن المخزون.'
    ],
    tipsEn: [
      'Use the statistics dashboard to forecast monthly drug budgets, monitor room occupancy, and identify high-demand items.',
      'Available to Administrators and Pharmacists to align daily tasks and balance warehouse allocations.'
    ]
  },
  {
    id: 'users',
    icon: '⚙️',
    titleAr: 'إدارة المستخدمين والصلاحيات (Users & RBAC Access Control)',
    titleEn: 'User Management & Role-Based Access Control (RBAC)',
    shortDescAr: 'نظام إدارة هويات الكادر الصحي والإداري، مع تطبيق مصفوفة الصلاحيات الدقيقة (RBAC) لثلاثة أدوار وظيفية: مدير النظام، الصيدلي، والمشاهد، مع حماية أمان الحسابات.',
    shortDescEn: 'User identity management with role-based access control (RBAC) across three operational roles: Administrator, Pharmacist, and Viewer, safeguarding patient privacy.',
    categoryAr: 'إدارة النظام والأمان',
    categoryEn: 'Administration',
    kpisAr: [
      'دور مدير النظام (System Administrator): صلاحيات إدارية ورقابية شاملة على المستخدمين، المخزون، الصرف، المستفيدين، سجلات التدقيق والأمان.',
      'دور الصيدلي المعتمد (Pharmacist): إدارة المستودع الدوائي، تنفيذ عمليات الصرف، فحص الحساسيات، رصد الأعراض الجانبية، والتسويات المخزنية.',
      'دور المشاهد / المدقق (Viewer / Auditor): استعراض السجلات والتقارير في وضع القراءة فقط دون إمكانية التعديل أو الحذف لضمان النزاهة.',
      'مصفوفة الصلاحيات الدقيقة (Granular RBAC) التي تحجب أو تظهر الأزرار والشاشات وفق الصفة الوظيفية المسجلة.'
    ],
    kpisEn: [
      'System Administrator: Master governance over user accounts, permissions, warehouse, dispensing, resident files, and audit trails.',
      'Pharmacist: Management of drug catalog, dispensing transactions, allergy checks, side effect monitoring, and inventory adjustments.',
      'Viewer / Auditor: Read-only access across audit records, reports, and dashboards without modification or deletion privileges.',
      'Granular RBAC matrix dynamically showing or hiding UI controls based on active staff roles.'
    ],
    featuresAr: [
      {
        title: 'مصفوفة الصلاحيات الدقيقة (Granular RBAC)',
        desc: 'حجب وإظهار الأزرار والشاشات بناءً على الدور المسجل للمستخدم لمنع أي إجراء غير مصرح به على السجلات الطبية والدوائية.'
      },
      {
        title: 'إضافة وتعيين حسابات الموظفين الجدد',
        desc: 'إنشاء حسابات جديدة بكلمات مرور نصية في قاعدة البيانات، مع التحقق من الدخول داخل الخادم وتعيين الأدوار الوظيفية (مدير، صيدلي، مشاهد) وتوثيق بيانات الاتصال.'
      },
      {
        title: 'تجميد وحذف الحسابات وإعادة تعيين كلمات المرور',
        desc: 'إمكانية إيقاف وصول أي حساب فوراً أو تعديل كلمة المرور أو حذف الحسابات المنتهية خدماتها لضمان أمان النظام.'
      },
      {
        title: 'حماية سرية البيانات الطبية والمخزنية',
        desc: 'تطبيق مبدأ الصلاحيات الأدنى لمنع اطلاع غير المخولين على الملفات الطبية الحساسة لمستفيدي المركز.'
      }
    ],
    featuresEn: [
      {
        title: 'Granular RBAC Permission Matrix',
        desc: 'Dynamically exposes or restricts navigation tabs and action buttons based on assigned staff roles.'
      },
      {
        title: 'Staff Onboarding & Role Provisioning',
        desc: 'Provision credentials, assign functional roles (Admin, Pharmacist, Viewer), and record official contact details.'
      },
      {
        title: 'Account Suspension & Password Reset',
        desc: 'Instantly suspend access, update passwords, or delete inactive staff profiles to safeguard patient confidentiality.'
      },
      {
        title: 'Medical Data Privacy Enforcement',
        desc: 'Enforces least-privilege principles preventing unauthorized eyes from accessing sensitive resident records.'
      }
    ],
    stepsAr: [
      'افتح شاشة "إدارة المستخدمين" من القائمة العلوية لمراجعة قائمة الحسابات وأدوارها.',
      'لإضافة موظف جديد، انقر زر "+ إضافة مستخدم جديد".',
      'أدخل اسم الموظف، بريده الإلكتروني، كلمة مرور قوية، وحدد دوره الوظيفي (مدير، صيدلي، مشاهد).',
      'اضغط "حفظ المستخدم" لإنشاء الحساب فوراً وتمكينه من الدخول.',
      'لتعديل صلاحية مستخدم أو تغيير كلمة مروره، انقر على أيقونة التعديل (✏️) في الصف المقابل له.',
      'لتجميد أو حذف حساب، استخدم زر الحذف الأحمر بعد التأكد من صفة الحساب.',
      'يستطيع مدير النظام فتح شاشة "إيميلات التنبيهات والأمان" لتحديث عناوين البريد الإلكتروني المعتمدة لاستلام التنبيهات الدوائية التلقائية وتقارير الصلاحية وحفظها سحابياً.'
    ],
    stepsEn: [
      'Open Users Management tab from navigation bar to inspect registered staff and assigned roles.',
      'Click "+ Add New User" to launch onboarding modal.',
      'Supply staff full name, email address, secure password, and select appropriate role (Admin, Pharmacist, Viewer).',
      'Click "Save User" to provision credentials immediately.',
      'To edit role privileges or reset credentials, click the pencil edit icon (✏️) on the user row.',
      'To revoke credentials or delete an account, click the red trash icon after verifying account ownership.',
      'The System Administrator can open the Alert Emails & Security tab to configure and update the notification recipient emails for automated clinical alerts and expiration reports.'
    ],
    tipsAr: [
      'احرص دائماً على تطبيق مبدأ الصلاحيات الأدنى (Least Privilege) وعدم منح صلاحية "مدير النظام" إلا للمسؤول المعتمد فقط.',
      'قم بتجميد أو حذف حساب أي موظف فور انتهاء فترة تكليفه بالمركز لمنع أي دخول غير مصرح به.'
    ],
    tipsEn: [
      'Strictly adhere to the Principle of Least Privilege, reserving Administrator privileges exclusively for authorized leads.',
      'Immediately deactivate or remove credentials of reassigned or departed personnel to prevent unauthorized access.'
    ]
  },
  {
    id: 'security',
    icon: '🛡️',
    titleAr: 'مركز الأمان وحماية الجلسات والمراسلات (Security & Single Session)',
    titleEn: 'Security Governance, Single Active Session & Digital Dispatch',
    shortDescAr: 'منظومة الأمان المتقدمة: منع تكرار الدخول بنفس الحساب بالتزامن (Single Active Session)، تغيير كلمة المرور الذاتي، وسجل الجلسات وعناوين الـ IP، وإعدادات خادم المراسلات.',
    shortDescEn: 'Enterprise security suite: single active session enforcement preventing simultaneous duplicate logins, self-service password changes, IP session tracking, and email dispatch configuration.',
    categoryAr: 'الأمان والرقابة',
    categoryEn: 'Security & Governance',
    kpisAr: [
      'حماية الجلسة النشطة الواحدة (Single Active Session Protection): منع تكرار الدخول بنفس الحساب بالتزامن من أكثر من جهاز لحماية الحساب من المشاركة أو الاختراق.',
      'ميزة تغيير كلمة المرور الذاتية لأي مستخدم مع التحقق الصارم من صحة كلمة المرور الحالية في قاعدة البيانات.',
      'عنوان الـ IP الفعلي للجهاز المتصل ووقت الدخول بالثانية لكشف أي محاولات دخول غير مصرح بها.',
      'خادم المراسلات الرقمية والبريد الإلكتروني الذكي لإرسال التقارير التلقائية مع دعم روابط بديلة لتفادي استهلاك الكوتا.'
    ],
    kpisEn: [
      'Single Active Session concurrency shield: blocks simultaneous logins under the same account to prevent shared credentials.',
      'Self-service user password modification verified strictly against live database records.',
      'Actual client IP address and exact second timestamps capturing every access attempt.',
      'Resilient digital dispatch gateway delivering automated morning reports with failover endpoints.'
    ],
    featuresAr: [
      {
        title: 'منع تكرار الدخول المتزامن (Single Active Session Protection)',
        desc: 'نظام حماية أمني متطور: إذا كان المستخدم مسجلاً للدخول بالفعل من جهاز، وحاول شخص آخر الدخول بنفس الحساب من جهاز ثانٍ، يمنعه النظام أو يطلب تأكيد إنهاء الجلسة السابقة لضمان عدم سرقة الحسابات.'
      },
      {
        title: 'تغيير كلمة المرور الذاتي والآمن',
        desc: 'إمكانية قيام أي مستخدم بتغيير كلمة المرور الخاصة به في أي وقت من الشريط العلوي، مع التحقق الصارم من كلمة المرور القديمة ضد قاعدة البيانات ومطابقة كلمة المرور الجديدة.'
      },
      {
        title: 'سجل الجلسات وعناوين الـ IP اللحظي',
        desc: 'توثيق كل جلسة دخول بعنوان الـ IP الحقيقي للجهاز ووقت الدخول واسم المستخدم لضمان الشفافية الكاملة والمحاسبة.'
      },
      {
        title: 'بوابة المراسلات الرقمية والبريد الإلكتروني الذكي',
        desc: 'تكوين روابط خادم الإرسال لإرسال التقارير التلقائية عبر البريد الإلكتروني مع دعم روابط بديلة لتفادي استهلاك الكوتا اليومية.'
      }
    ],
    featuresEn: [
      {
        title: 'Single Active Session Concurrency Intercept',
        desc: 'State-of-the-art safeguard: if an account is actively logged in on one device, subsequent login attempts from another device are intercepted with confirmation prompts.'
      },
      {
        title: 'Self-Service Secure Password Management',
        desc: 'Enables any logged-in staff member to change their password securely, strictly authenticating current credentials against the live database.'
      },
      {
        title: 'Real-Time Session & Client IP Ledger',
        desc: 'Captures actual connected IP addresses, device timestamps, and user identities for complete auditability.'
      },
      {
        title: 'Resilient Digital Dispatch & Email Gateway',
        desc: 'Configures endpoints to dispatch automated morning medication reports with backup failover URL support.'
      }
    ],
    stepsAr: [
      'لتغيير كلمة مرورك، انقر على زر "تغيير كلمة المرور 🔑" في الشريط العلوي.',
      'أدخل كلمة المرور الحالية، ثم اكتب كلمة المرور الجديدة وأكد كتابتها، ثم اضغط "تأكيد وتحديث كلمة المرور".',
      'في حال حاولت الدخول من جهاز جديد وكان حسابك مفتوحاً في جهاز آخر، ستظهر لك رسالة تفيد بوجود جلسة نشطة وتطلب منك تأكيد إنهاء الجلسة القديمة.',
      'لضبط خادم البريد، افتح شاشة الأمان، وأدخل رابط خدمة الإرسال واضغط "حفظ وتجربة الإرسال".',
      'راجع جدول الجلسات النشطة وعناوين الـ IP للتأكد من عدم وجود أجهزة غريبة متصلة بحسابك.'
    ],
    stepsEn: [
      'To update credentials, click the "Change Password 🔑" button in the top header.',
      'Enter your current password, type the new password, confirm it, and click "Confirm & Update Password".',
      'If signing in from a new workstation while an active session exists elsewhere, review and confirm the session takeover prompt.',
      'To configure email dispatches, open Security Center, supply endpoint URL, and click "Save & Test Dispatch".',
      'Audit the active sessions table periodically to verify authorized client IPs.'
    ],
    tipsAr: [
      'لا تشارك كلمة المرور الخاصة بك مع أي زميل؛ كل موظف يجب أن يمتلك حسابه المنفصل لضمان دقة سجل التدقيق.',
      'احرص دائماً على الضغط على زر "تسجيل الخروج 🚪" عند الانتهاء من نوبة عملك لإنهاء الجلسة وإتاحة الدخول من جهاز آخر بسلاسة.'
    ],
    tipsEn: [
      'Never share your credentials with colleagues; individual accounts ensure legal traceability in the audit ledger.',
      'Always click "Sign Out 🚪" when leaving your shift to release your active session cleanly.'
    ]
  },
  {
    id: 'audit_logs',
    icon: '📋',
    titleAr: 'سجل التدقيق والمراقبة العامة (Comprehensive Audit Trail)',
    titleEn: 'Comprehensive Audit Trail & Compliance Ledger',
    shortDescAr: 'سجل المراقبة المحكم الذي يدون كل حركة تعديل أو إضافة أو حذف أو صرف دواء أو تسوية مخزنية، مع هوية الموظف والوقت بالثانية كمرجع رسمي غير قابل للتعديل.',
    shortDescEn: 'Immutable regulatory audit trail capturing every modification, creation, dispensing, stock adjustment, and deletion event with user signatures.',
    categoryAr: 'الرقابة والجودة',
    categoryEn: 'Compliance & Audit',
    kpisAr: [
      'إجمالي الحركات والعمليات المسجلة في قاعدة البيانات التراكمية الدائمة.',
      'أنواع الإجراءات: إضافة دواء، صرف دواء، تسوية يدوية، تعديل مستفيد، حذف صنف، تسجيل عرض جانبي...',
      'المعرف الفريد للمستخدم المنفذ للإجراء وصفته الوظيفية واسمه المعتمد.',
      'التاريخ والتوقيت الدقيق لكل حدث سريري أو مستودعي بالثانية.'
    ],
    kpisEn: [
      'Total immutable transaction records cataloged in database.',
      'Action classifications: Drug Added, Dose Dispensed, Stock Adjustment, Resident Edited, Item Deleted...',
      'Unique user ID, role, and staff name executing the action.',
      'Exact timestamp, delta units, and state transitions captured with second precision.'
    ],
    featuresAr: [
      {
        title: 'التسجيل الآلي الإلزامي (Zero-Touch Logging)',
        desc: 'لا يمكن لأي مستخدم تجاوز التدقيق؛ كل تعديل في المخزون أو الصرف أو بيانات المستفيدين يوثق آلياً في اللحظة نفسها.'
      },
      {
        title: 'التصفية الذكية والبحث المتقدم في السجلات',
        desc: 'البحث باسم المستخدم، أو نوع العملية، أو اسم الدواء لسرعة التحقيق والمراجعة الإدارية والرقابية.'
      },
      {
        title: 'سجل دائم غير قابل للتعديل أو الحذف',
        desc: 'تصميم أمني محكم يمنع أي مستخدم مهما كانت رتبته من حذف أو تعديل أي سطر مسجل في سجل التدقيق لضمان النزاهة المطلقة.'
      },
      {
        title: 'تصدير وطباعة سجل التدقيق الشامل',
        desc: 'استخراج وثيقة تدقيق ورقية رسمية متوافقة مع متطلبات التفتيش الصيدلاني والرقابة الصحية.'
      }
    ],
    featuresEn: [
      {
        title: 'Zero-Touch Automatic Logging',
        desc: 'Every inventory change, dispense event, and profile modification is permanently captured without manual intervention.'
      },
      {
        title: 'Smart Ledger Search & Deep Filters',
        desc: 'Query historical records by staff name, action category, or medication name for swift administrative reviews.'
      },
      {
        title: 'Immutable Integrity Guarantee',
        desc: 'Architected so that no user, regardless of rank, can delete or tamper with historical audit ledger entries.'
      },
      {
        title: 'Official Regulatory Audit Printout',
        desc: 'Export formal audit ledger documents compliant with national health inspection and accreditation guidelines.'
      }
    ],
    stepsAr: [
      'افتح شاشة "سجل التدقيق" لاستعراض أحدث الأنشطة التي تمت على المنظومة بترتيب زمني عكسي.',
      'استخدم حقل البحث لتتبع حركة صنف معين (مثال: ابحث باسم دواء لمعرفة من أضافه أو صرفه أو أجرى عليه تسوية).',
      'استخدم فلتر الإجراءات لعرض عمليات محددة (مثل: عمليات الصرف فقط أو عمليات الحذف فقط).',
      'اضغط زر "طباعة سجل التدقيق 🖨️" للحصول على نسخة رسمية للمراجعة الدورية واجتماعات الجودة.'
    ],
    stepsEn: [
      'Open Audit Trail to view recent operations displayed in reverse chronological order.',
      'Search by medication name to trace its entire lifecycle (who added, adjusted, or dispensed it).',
      'Filter by action type to isolate specific events (e.g. Dispensing only, or Stock Adjustments only).',
      'Click "Print Audit Report 🖨️" to generate formal documentation for accreditation inspections.'
    ],
    tipsAr: [
      'سجل التدقيق وثيقة رسمية نظامية تستخدم كمرجع أساسي عند حدوث أي استفسار أو تدقيق سريري أو مالي.',
      'راجع سجل التدقيق في نهاية كل أسبوع للتأكد من انضباط العمليات وتطابق أسباب التسويات المخزنية.'
    ],
    tipsEn: [
      'The audit ledger is an immutable legal record vital for resolving clinical inquiries or stock discrepancies.',
      'Audit the ledger weekly to ensure staff compliance with documented stock adjustment policies.'
    ]
  },
  {
    id: 'customization_and_pwa',
    icon: '🎨',
    titleAr: 'تخصيص المظهر وتثبيت التطبيق (Themes, PWA & Offline Access)',
    titleEn: 'Visual Themes, Skins, PWA Installation & Offline Continuity',
    shortDescAr: 'دليل تخصيص مظهر النظام بين 4 خيارات لونية فاخرة، مع التبديل بين الوضعين النهاري والليلي، والعمل دون اتصال بالإنترنت، وتثبيت التطبيق المستقل.',
    shortDescEn: 'Color themes engine (4 professional skins), instant Day/Night toggles, offline clinical data persistence, and progressive web app (PWA) installation.',
    categoryAr: 'النظام والتقنية',
    categoryEn: 'System & Technology',
    kpisAr: [
      '4 مظاهر احترافية ملائمة لبيئات الرعاية: كحلي داكن كلاسيكي (Midnight)، رمادي زمردي (Slate Emerald)، أبيض سريري ناصع (Clinical Daylight)، ونِيلي ملكي (Royal Indigo).',
      'التنقل الفوري بين الوضع النهاري والليلي بضغطة زر واحدة (🌙/☀️).',
      'دعم كامل وثنائي الاتجاه للغتين العربية (RTL) والإنجليزية (LTR).',
      'جاهزية العمل عند انقطاع الإنترنت (Offline-Ready) مع مزامنة محلية وقاعدة بيانات Firebase Firestore السحابية.'
    ],
    kpisEn: [
      '4 clinical themes: Midnight Dark, Slate Emerald, Clinical Daylight White, and Royal Indigo.',
      'Instant 1-click toggle between Day and Night modes (🌙/☀️).',
      'Full bi-directional internationalization: Arabic (RTL) and English (LTR).',
      'Offline-ready PWA with local database persistence and Firebase Firestore cloud sync.'
    ],
    featuresAr: [
      {
        title: 'محرك ألوان النظام التفاعلي (Dynamic Skins Engine)',
        desc: 'تطبيق فوري لدرجات الخلفية والبطاقات والأزرار والإطارات عند اختيار أي مظهر دون الحاجة لإعادة تحميل الصفحة.'
      },
      {
        title: 'تثبيت تطبيق الويب التقدمي (PWA Install)',
        desc: 'إمكانية تثبيت المنظومة كتطبيق مستقل على أجهزة الحاسوب المكتبي واللوحي والأجهزة الذكية بنقرة واحدة لسرعة التشغيل.'
      },
      {
        title: 'العمل المستمر عند انقطاع الإنترنت (Offline Continuity)',
        desc: 'حفظ مستمر وآمن للبيانات محلياً وسحابياً لضمان استمرار أعمال الصرف والتدقيق حتى عند انقطاع الاتصال بالشبكة مع المزامنة التلقائية عند عودة الاتصال.'
      },
      {
        title: 'التبديل اللغوي الفوري (عربي / English)',
        desc: 'دعم كامل للواجهتين العربية والإنجليزية مع ضبط تلقائي لاتجاه النصوص والمحاذاة لكافة الشاشات والنوافذ.'
      }
    ],
    featuresEn: [
      {
        title: 'Dynamic Skins Engine',
        desc: 'Instant palette application across cards, buttons, and backgrounds without reloading the application.'
      },
      {
        title: 'Progressive Web App (PWA) Standalone Installation',
        desc: 'Install system as a dedicated desktop or mobile application with standalone window launching.'
      },
      {
        title: 'Offline Continuity & Cloud Synchronization',
        desc: 'Robust local persistence allowing uninterrupted clinical tasks during network outages, auto-syncing with cloud upon reconnect.'
      },
      {
        title: 'Instant Bilingual Language Toggle',
        desc: 'Seamless switching between Arabic (RTL) and English (LTR) with complete layout mirroring.'
      }
    ],
    stepsAr: [
      'انقر على أيقونة لوحة الألوان 🎨 في الشريط العلوي لفتح نافذة اختيار المظهر (Skins).',
      'اختر المظهر المفضل لديك ليتم تطبيقه على الفور.',
      'للتحويل السريع إلى الوضع النهاري أو الليلي، انقر على زر الشمس/القمر (🌙/☀️).',
      'للتبديل بين العربية والإنجليزية، انقر على زر اللغة (AR / EN) بجانب المظهر.',
      'لتثبيت البرنامج كتطبيق مستقل على حاسوبك، انقر على زر "تثبيت التطبيق 📲" في شريط المتصفح أو القائمة واتبع التعليمات.'
    ],
    stepsEn: [
      'Click the palette icon 🎨 in the header bar to open Themes & Skins.',
      'Choose from any of the 4 color schemes to apply it in real-time.',
      'Toggle the Sun/Moon button (🌙/☀️) for quick Dark / Light mode switching.',
      'Click the language button (AR / EN) to mirror the layout between Arabic and English.',
      'Click "Install App 📲" in your browser bar or menu to run as a standalone desktop app.'
    ],
    tipsAr: [
      'يوصى باختيار مظهر "أبيض سريري ناصع" للشاشات التي تستخدم في وضح النهار بالعيادات، والمظاهر الداكنة لورديات العمل الليلية لراحة العين.',
      'تثبيت التطبيق عبر PWA يوفر سرعة تشغيل فائقة وعملاً سلساً في غرف التمريض حتى عند ضعف شبكة الإنترنت.'
    ],
    tipsEn: [
      'Use Clinical Daylight White in bright clinic rooms, and dark midnight themes for night shifts to reduce eye strain.',
      'Installing via PWA provides instant launch speed and offline reliability in nursing stations with intermittent Wi-Fi.'
    ]
  }
];
