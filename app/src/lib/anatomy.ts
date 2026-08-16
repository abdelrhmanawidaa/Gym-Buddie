import type { MuscleKey } from './muscles';

export interface MusclePart {
  en: string;
  ar: string;
}

export interface MuscleAnatomy {
  /** Where it sits on the body, in plain language. */
  locationEn: string;
  locationAr: string;
  /** What movement it actually produces. */
  functionEn: string;
  functionAr: string;
  /** The individual heads / sub-muscles people train separately. */
  parts: MusclePart[];
  /**
   * Best-lift-to-bodyweight ratios marking the top of each level
   * (novice → beginner → intermediate → advanced → elite).
   * Null for muscles usually trained without meaningful external load.
   */
  strengthRatios: [number, number, number, number, number] | null;
}

export const MUSCLE_ANATOMY: Record<MuscleKey, MuscleAnatomy> = {
  chest: {
    locationEn: 'The broad fan of muscle across the front of your ribcage, from your breastbone out to your shoulder.',
    locationAr: 'العضلة العريضة اللي قدام القفص الصدري، من عضمة الصدر لحد الكتف.',
    functionEn: 'Pushes your arms forward and squeezes them toward the middle of your body.',
    functionAr: 'بتدفع الدراع لقدام وبتقرّبه ناحية نص الجسم.',
    parts: [
      { en: 'Upper chest (clavicular)', ar: 'الصدر العلوي' },
      { en: 'Mid chest (sternal)', ar: 'الصدر الأوسط' },
      { en: 'Lower chest', ar: 'الصدر السفلي' },
    ],
    strengthRatios: [0.5, 0.75, 1.0, 1.25, 1.5],
  },
  back: {
    locationEn: 'The large muscles spanning your mid and lower back, widest under the armpits and tapering to the waist.',
    locationAr: 'العضلات الكبيرة في وسط وأسفل الضهر، أعرض حاجة تحت الإبط وبتضيق ناحية الوسط.',
    functionEn: 'Pulls your arms down and back toward your body — every pulling movement.',
    functionAr: 'بتسحب الدراع لتحت ولورا ناحية الجسم — كل حركات السحب.',
    parts: [
      { en: 'Lats (latissimus dorsi)', ar: 'العضلة الجناحية' },
      { en: 'Rhomboids', ar: 'المعينية' },
      { en: 'Teres major', ar: 'المدورة الكبيرة' },
      { en: 'Lower back (erectors)', ar: 'أسفل الضهر' },
    ],
    strengthRatios: [0.5, 0.7, 0.9, 1.1, 1.3],
  },
  shoulders: {
    locationEn: 'The rounded cap sitting over each shoulder joint, wrapping front, side and back.',
    locationAr: 'الجزء المدور اللي فوق مفصل الكتف، وبيلف قدام وجنب ووراء.',
    functionEn: 'Raises your arm in every direction — overhead, out to the side, and behind you.',
    functionAr: 'بترفع الدراع في كل الاتجاهات — فوق وعالجنب ولورا.',
    parts: [
      { en: 'Front delt (anterior)', ar: 'الكتف الأمامي' },
      { en: 'Side delt (lateral)', ar: 'الكتف الجانبي' },
      { en: 'Rear delt (posterior)', ar: 'الكتف الخلفي' },
    ],
    strengthRatios: [0.35, 0.5, 0.65, 0.8, 1.0],
  },
  traps: {
    locationEn: 'The diamond running from the base of your skull, across the top of your shoulders, down to mid-back.',
    locationAr: 'العضلة المعينية من أسفل الجمجمة، على طول أعلى الكتف، لحد وسط الضهر.',
    functionEn: 'Shrugs your shoulders up and pulls your shoulder blades together and down.',
    functionAr: 'بترفع الكتف لفوق وبتقرّب لوح الكتف من بعضه ولتحت.',
    parts: [
      { en: 'Upper traps', ar: 'الترابيس العلوية' },
      { en: 'Mid traps', ar: 'الترابيس الوسطى' },
      { en: 'Lower traps', ar: 'الترابيس السفلية' },
    ],
    strengthRatios: [0.5, 0.8, 1.1, 1.4, 1.8],
  },
  biceps: {
    locationEn: 'The front of your upper arm, between shoulder and elbow.',
    locationAr: 'قدام الدراع من فوق، بين الكتف والكوع.',
    functionEn: 'Bends your elbow and rotates your palm upward.',
    functionAr: 'بتثني الكوع وبتلف الكف لفوق.',
    parts: [
      { en: 'Long head (outer)', ar: 'الرأس الطويلة (الخارجية)' },
      { en: 'Short head (inner)', ar: 'الرأس القصيرة (الداخلية)' },
      { en: 'Brachialis (underneath)', ar: 'العضدية (تحتها)' },
    ],
    strengthRatios: [0.25, 0.35, 0.45, 0.6, 0.75],
  },
  triceps: {
    locationEn: 'The back of your upper arm — roughly two thirds of your arm’s total size.',
    locationAr: 'ورا الدراع من فوق — تقريبًا تلتين حجم الدراع كله.',
    functionEn: 'Straightens your elbow. Works in every pressing movement.',
    functionAr: 'بتفرد الكوع. بتشتغل في كل حركات الدفع.',
    parts: [
      { en: 'Long head', ar: 'الرأس الطويلة' },
      { en: 'Lateral head (outer)', ar: 'الرأس الجانبية' },
      { en: 'Medial head (inner)', ar: 'الرأس الداخلية' },
    ],
    strengthRatios: [0.3, 0.45, 0.6, 0.75, 0.9],
  },
  forearms: {
    locationEn: 'Between elbow and wrist, on both the palm side and the back of the arm.',
    locationAr: 'بين الكوع والرسغ، من ناحية الكف ومن ورا الدراع.',
    functionEn: 'Bends and straightens your wrist, and drives your grip strength.',
    functionAr: 'بتثني وتفرد الرسغ، وهي أساس قوة القبضة.',
    parts: [
      { en: 'Flexors (palm side)', ar: 'القابضة (ناحية الكف)' },
      { en: 'Extensors (back side)', ar: 'الباسطة (ناحية الظهر)' },
      { en: 'Brachioradialis', ar: 'العضدية الكعبرية' },
    ],
    strengthRatios: [0.15, 0.25, 0.35, 0.45, 0.6],
  },
  quads: {
    locationEn: 'The front of your thigh, from hip to knee — the biggest muscle group in your body.',
    locationAr: 'قدام الفخذ من الحوض للركبة — أكبر مجموعة عضلية في الجسم.',
    functionEn: 'Straightens your knee and helps drive your hip out of a squat.',
    functionAr: 'بتفرد الركبة وبتساعد الحوض يطلع من السكوات.',
    parts: [
      { en: 'Rectus femoris', ar: 'المستقيمة الفخذية' },
      { en: 'Vastus lateralis (outer sweep)', ar: 'المتسعة الجانبية' },
      { en: 'Vastus medialis (teardrop)', ar: 'المتسعة الإنسية' },
      { en: 'Vastus intermedius', ar: 'المتسعة المتوسطة' },
    ],
    strengthRatios: [0.75, 1.0, 1.25, 1.6, 2.0],
  },
  hamstrings: {
    locationEn: 'The back of your thigh, running from your sit bones down behind the knee.',
    locationAr: 'ورا الفخذ، من عضم الحوض لحد ورا الركبة.',
    functionEn: 'Bends your knee and pushes your hips forward from a bent position.',
    functionAr: 'بتثني الركبة وبتدفع الحوض لقدام من وضع الانحناء.',
    parts: [
      { en: 'Biceps femoris', ar: 'ذات الرأسين الفخذية' },
      { en: 'Semitendinosus', ar: 'نصف الوترية' },
      { en: 'Semimembranosus', ar: 'نصف الغشائية' },
    ],
    strengthRatios: [0.6, 0.9, 1.2, 1.5, 1.8],
  },
  glutes: {
    locationEn: 'Your backside — the thickest single muscle you have.',
    locationAr: 'المؤخرة — أتخن عضلة مفردة في الجسم.',
    functionEn: 'Drives your hips forward and stabilises you on one leg.',
    functionAr: 'بتدفع الحوض لقدام وبتثبتك وانت واقف على رجل واحدة.',
    parts: [
      { en: 'Gluteus maximus', ar: 'الألوية الكبيرة' },
      { en: 'Gluteus medius', ar: 'الألوية المتوسطة' },
      { en: 'Gluteus minimus', ar: 'الألوية الصغيرة' },
    ],
    strengthRatios: [0.75, 1.2, 1.6, 2.0, 2.5],
  },
  calves: {
    locationEn: 'The back of your lower leg, between knee and ankle.',
    locationAr: 'ورا الرجل من تحت، بين الركبة والكاحل.',
    functionEn: 'Points your toes down — every step, jump and sprint.',
    functionAr: 'بتنزل أصابع الرجل لتحت — في كل خطوة ونطة وجري.',
    parts: [
      { en: 'Gastrocnemius (the visible diamond)', ar: 'التوأمية (الظاهرة)' },
      { en: 'Soleus (underneath)', ar: 'النعلية (تحتها)' },
    ],
    strengthRatios: [0.5, 0.8, 1.2, 1.6, 2.0],
  },
  abs: {
    locationEn: 'The front and sides of your midsection, from ribcage down to hips.',
    locationAr: 'قدام وجنب الوسط، من القفص الصدري لحد الحوض.',
    functionEn: 'Bends and twists your torso, and braces your spine under heavy load.',
    functionAr: 'بتثني وتلف الجذع، وبتثبّت العمود الفقري تحت الأوزان التقيلة.',
    parts: [
      { en: 'Rectus abdominis (the six-pack)', ar: 'المستقيمة البطنية (الستة)' },
      { en: 'Obliques (sides)', ar: 'المائلة (الجناب)' },
      { en: 'Transverse abdominis (deep)', ar: 'المستعرضة (العميقة)' },
    ],
    strengthRatios: null,
  },
};

/** Secondary (assisting) muscles worked by each exercise, keyed by English name. */
export const EXERCISE_SECONDARY: Record<string, MuscleKey[]> = {
  // Chest
  'Barbell Bench Press': ['triceps', 'shoulders'],
  'Dumbbell Bench Press': ['triceps', 'shoulders'],
  'Incline Dumbbell Press': ['shoulders', 'triceps'],
  'Chest Press Machine': ['triceps', 'shoulders'],
  'Pec Deck Fly': ['shoulders'],
  'Cable Crossover': ['shoulders'],
  'Push-ups': ['triceps', 'shoulders', 'abs'],

  // Back
  'Lat Pulldown': ['biceps', 'forearms'],
  'Pull-ups': ['biceps', 'forearms', 'abs'],
  'Seated Cable Row': ['biceps', 'traps', 'forearms'],
  'Barbell Row': ['biceps', 'traps', 'forearms'],
  'Dumbbell Row': ['biceps', 'traps', 'forearms'],
  'T-Bar Row': ['biceps', 'traps', 'forearms'],
  'Straight-Arm Pulldown': ['triceps', 'abs'],

  // Shoulders
  'Overhead Barbell Press': ['triceps', 'traps', 'abs'],
  'Dumbbell Shoulder Press': ['triceps', 'traps'],
  'Shoulder Press Machine': ['triceps'],
  'Lateral Raise': ['traps'],
  'Cable Lateral Raise': ['traps'],
  'Front Raise': ['chest'],
  'Rear Delt Fly': ['traps', 'back'],
  'Face Pull': ['traps', 'back'],

  // Traps
  'Barbell Shrug': ['forearms'],
  'Dumbbell Shrug': ['forearms'],
  'Cable Shrug': ['forearms'],

  // Biceps
  'Barbell Curl': ['forearms'],
  'EZ-Bar Curl': ['forearms'],
  'Dumbbell Curl': ['forearms'],
  'Hammer Curl': ['forearms'],
  'Preacher Curl': ['forearms'],
  'Cable Curl': ['forearms'],

  // Triceps
  'Triceps Pushdown': [],
  'Overhead Triceps Extension': [],
  'Skull Crusher': [],
  'Close-Grip Bench Press': ['chest', 'shoulders'],
  Dips: ['chest', 'shoulders'],

  // Forearms
  'Wrist Curl': [],
  'Reverse Wrist Curl': [],
  "Farmer's Walk": ['traps', 'abs'],

  // Quads
  'Back Squat': ['glutes', 'hamstrings', 'abs'],
  'Front Squat': ['glutes', 'abs'],
  'Leg Press': ['glutes', 'hamstrings'],
  'Leg Extension': [],
  'Hack Squat': ['glutes'],
  'Walking Lunges': ['glutes', 'hamstrings'],
  'Bulgarian Split Squat': ['glutes', 'hamstrings'],

  // Hamstrings
  'Romanian Deadlift': ['glutes', 'back', 'forearms'],
  'Lying Leg Curl': ['calves'],
  'Seated Leg Curl': ['calves'],
  'Good Morning': ['glutes', 'back'],
  'Stiff-Leg Deadlift': ['glutes', 'back', 'forearms'],

  // Glutes
  'Hip Thrust': ['hamstrings', 'quads'],
  'Glute Bridge': ['hamstrings'],
  'Cable Kickback': ['hamstrings'],
  'Sumo Deadlift': ['hamstrings', 'quads', 'back', 'traps'],

  // Calves
  'Standing Calf Raise': [],
  'Seated Calf Raise': [],
  'Leg Press Calf Raise': [],

  // Abs
  Plank: ['shoulders', 'glutes'],
  'Cable Crunch': [],
  'Hanging Leg Raise': ['forearms', 'quads'],
  Crunches: [],
  'Russian Twist': [],
};
