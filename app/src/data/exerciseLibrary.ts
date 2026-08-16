import type { MuscleKey } from '../lib/muscles';

export interface LibraryExercise {
  name: string;
  nameAr: string;
  muscle: MuscleKey;
  machine: string;
  machineAr: string;
  targetSets: number;
  targetRepsLow: number;
  targetRepsHigh: number;
}

/**
 * Master list of exercises, grouped by muscle so every muscle has several
 * machine/equipment alternatives to pick between.
 */
export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ---- Chest ----
  { name: 'Barbell Bench Press', nameAr: 'بنش برس بار', muscle: 'chest', machine: 'Flat Bench + Barbell', machineAr: 'بنش مستوي + بار', targetSets: 4, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Dumbbell Bench Press', nameAr: 'بنش برس دمبل', muscle: 'chest', machine: 'Flat Bench + Dumbbells', machineAr: 'بنش مستوي + دمبل', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Incline Dumbbell Press', nameAr: 'بنش علوي دمبل', muscle: 'chest', machine: 'Incline Bench + Dumbbells', machineAr: 'بنش مائل + دمبل', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Chest Press Machine', nameAr: 'جهاز دفع الصدر', muscle: 'chest', machine: 'Chest Press Machine', machineAr: 'جهاز الصدر', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Pec Deck Fly', nameAr: 'فراشة (بيك دك)', muscle: 'chest', machine: 'Pec Deck Machine', machineAr: 'جهاز البيك دك', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Cable Crossover', nameAr: 'كابل كروس', muscle: 'chest', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Push-ups', nameAr: 'ضغط', muscle: 'chest', machine: 'Bodyweight', machineAr: 'وزن الجسم', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 25 },

  // ---- Back ----
  { name: 'Lat Pulldown', nameAr: 'سحب أمامي', muscle: 'back', machine: 'Lat Pulldown Machine', machineAr: 'جهاز السحب الأمامي', targetSets: 4, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Pull-ups', nameAr: 'عقلة', muscle: 'back', machine: 'Pull-up Bar', machineAr: 'بار العقلة', targetSets: 3, targetRepsLow: 5, targetRepsHigh: 12 },
  { name: 'Seated Cable Row', nameAr: 'تجديف كابل جالس', muscle: 'back', machine: 'Seated Row Machine', machineAr: 'جهاز التجديف', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Barbell Row', nameAr: 'تجديف بار', muscle: 'back', machine: 'Barbell', machineAr: 'بار', targetSets: 3, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Dumbbell Row', nameAr: 'تجديف دمبل', muscle: 'back', machine: 'Dumbbell + Bench', machineAr: 'دمبل + بنش', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'T-Bar Row', nameAr: 'تجديف تي بار', muscle: 'back', machine: 'T-Bar Row Machine', machineAr: 'جهاز التي بار', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Straight-Arm Pulldown', nameAr: 'سحب بذراع مستقيمة', muscle: 'back', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },

  // ---- Shoulders ----
  { name: 'Overhead Barbell Press', nameAr: 'ضغط كتف بار', muscle: 'shoulders', machine: 'Barbell', machineAr: 'بار', targetSets: 4, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Dumbbell Shoulder Press', nameAr: 'ضغط كتف دمبل', muscle: 'shoulders', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Shoulder Press Machine', nameAr: 'جهاز ضغط الكتف', muscle: 'shoulders', machine: 'Shoulder Press Machine', machineAr: 'جهاز الكتف', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Lateral Raise', nameAr: 'رفرفة جانبي دمبل', muscle: 'shoulders', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Cable Lateral Raise', nameAr: 'رفرفة جانبي كابل', muscle: 'shoulders', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Front Raise', nameAr: 'رفرفة أمامي', muscle: 'shoulders', machine: 'Dumbbells / Plate', machineAr: 'دمبل / وزن', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Rear Delt Fly', nameAr: 'رفرفة خلفي', muscle: 'shoulders', machine: 'Reverse Pec Deck / Dumbbells', machineAr: 'بيك دك عكسي / دمبل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Face Pull', nameAr: 'سحب للوجه', muscle: 'shoulders', machine: 'Cable Machine + Rope', machineAr: 'كابل + حبل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },

  // ---- Traps ----
  { name: 'Barbell Shrug', nameAr: 'هز أكتاف بار', muscle: 'traps', machine: 'Barbell', machineAr: 'بار', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Dumbbell Shrug', nameAr: 'هز أكتاف دمبل', muscle: 'traps', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Cable Shrug', nameAr: 'هز أكتاف كابل', muscle: 'traps', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },

  // ---- Biceps ----
  { name: 'Barbell Curl', nameAr: 'مرجحة بار', muscle: 'biceps', machine: 'Straight Barbell', machineAr: 'بار مستقيم', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'EZ-Bar Curl', nameAr: 'مرجحة بار متعرج', muscle: 'biceps', machine: 'EZ Bar', machineAr: 'بار متعرج', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Dumbbell Curl', nameAr: 'مرجحة دمبل', muscle: 'biceps', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Hammer Curl', nameAr: 'مرجحة مطرقة', muscle: 'biceps', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Preacher Curl', nameAr: 'مرجحة على الكرسي المائل', muscle: 'biceps', machine: 'Preacher Bench', machineAr: 'كرسي المرجحة المائل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Cable Curl', nameAr: 'مرجحة كابل', muscle: 'biceps', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },

  // ---- Triceps ----
  { name: 'Triceps Pushdown', nameAr: 'دفع ترايسبس كابل', muscle: 'triceps', machine: 'Cable Machine + Rope', machineAr: 'كابل + حبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Overhead Triceps Extension', nameAr: 'تمديد ترايسبس أعلى الرأس', muscle: 'triceps', machine: 'Cable / Dumbbell', machineAr: 'كابل / دمبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Skull Crusher', nameAr: 'كسر الجمجمة', muscle: 'triceps', machine: 'EZ Bar + Bench', machineAr: 'بار متعرج + بنش', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Close-Grip Bench Press', nameAr: 'بنش قبضة ضيقة', muscle: 'triceps', machine: 'Barbell + Bench', machineAr: 'بار + بنش', targetSets: 3, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Dips', nameAr: 'متوازي', muscle: 'triceps', machine: 'Dip Bars', machineAr: 'المتوازي', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 15 },

  // ---- Forearms ----
  { name: 'Wrist Curl', nameAr: 'ثني الرسغ', muscle: 'forearms', machine: 'Barbell / Dumbbells', machineAr: 'بار / دمبل', targetSets: 3, targetRepsLow: 15, targetRepsHigh: 20 },
  { name: 'Reverse Wrist Curl', nameAr: 'ثني الرسغ عكسي', muscle: 'forearms', machine: 'Barbell / Dumbbells', machineAr: 'بار / دمبل', targetSets: 3, targetRepsLow: 15, targetRepsHigh: 20 },
  { name: "Farmer's Walk", nameAr: 'مشية المزارع', muscle: 'forearms', machine: 'Heavy Dumbbells', machineAr: 'دمبل تقيل', targetSets: 3, targetRepsLow: 30, targetRepsHigh: 60 },

  // ---- Quads ----
  { name: 'Back Squat', nameAr: 'سكوات خلفي', muscle: 'quads', machine: 'Squat Rack', machineAr: 'حامل السكوات', targetSets: 4, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Front Squat', nameAr: 'سكوات أمامي', muscle: 'quads', machine: 'Squat Rack', machineAr: 'حامل السكوات', targetSets: 3, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Leg Press', nameAr: 'دفع الأرجل', muscle: 'quads', machine: 'Leg Press Machine', machineAr: 'جهاز دفع الأرجل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Leg Extension', nameAr: 'تمديد الرجل', muscle: 'quads', machine: 'Leg Extension Machine', machineAr: 'جهاز تمديد الرجل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Hack Squat', nameAr: 'هاك سكوات', muscle: 'quads', machine: 'Hack Squat Machine', machineAr: 'جهاز الهاك سكوات', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Walking Lunges', nameAr: 'طعن بالمشي', muscle: 'quads', machine: 'Dumbbells', machineAr: 'دمبل', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Bulgarian Split Squat', nameAr: 'سكوات بلغاري', muscle: 'quads', machine: 'Dumbbells + Bench', machineAr: 'دمبل + بنش', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },

  // ---- Hamstrings ----
  { name: 'Romanian Deadlift', nameAr: 'رفعة رومانية', muscle: 'hamstrings', machine: 'Barbell', machineAr: 'بار', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 10 },
  { name: 'Lying Leg Curl', nameAr: 'ثني الرجل راقد', muscle: 'hamstrings', machine: 'Leg Curl Machine', machineAr: 'جهاز ثني الرجل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Seated Leg Curl', nameAr: 'ثني الرجل جالس', muscle: 'hamstrings', machine: 'Seated Leg Curl Machine', machineAr: 'جهاز ثني الرجل جالس', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Good Morning', nameAr: 'جود مورنينج', muscle: 'hamstrings', machine: 'Barbell', machineAr: 'بار', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Stiff-Leg Deadlift', nameAr: 'رفعة برجل مستقيمة', muscle: 'hamstrings', machine: 'Barbell / Dumbbells', machineAr: 'بار / دمبل', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },

  // ---- Glutes ----
  { name: 'Hip Thrust', nameAr: 'دفع الحوض', muscle: 'glutes', machine: 'Barbell + Bench', machineAr: 'بار + بنش', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Glute Bridge', nameAr: 'جسر المؤخرة', muscle: 'glutes', machine: 'Bodyweight / Barbell', machineAr: 'وزن الجسم / بار', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 20 },
  { name: 'Cable Kickback', nameAr: 'ركل خلفي كابل', muscle: 'glutes', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Sumo Deadlift', nameAr: 'رفعة سومو', muscle: 'glutes', machine: 'Barbell', machineAr: 'بار', targetSets: 3, targetRepsLow: 6, targetRepsHigh: 10 },

  // ---- Calves ----
  { name: 'Standing Calf Raise', nameAr: 'رفع السمانة واقف', muscle: 'calves', machine: 'Calf Raise Machine', machineAr: 'جهاز السمانة', targetSets: 4, targetRepsLow: 12, targetRepsHigh: 20 },
  { name: 'Seated Calf Raise', nameAr: 'رفع السمانة جالس', muscle: 'calves', machine: 'Seated Calf Machine', machineAr: 'جهاز السمانة جالس', targetSets: 3, targetRepsLow: 15, targetRepsHigh: 20 },
  { name: 'Leg Press Calf Raise', nameAr: 'سمانة على جهاز الدفع', muscle: 'calves', machine: 'Leg Press Machine', machineAr: 'جهاز دفع الأرجل', targetSets: 3, targetRepsLow: 15, targetRepsHigh: 20 },

  // ---- Abs ----
  { name: 'Plank', nameAr: 'بلانك', muscle: 'abs', machine: 'Bodyweight', machineAr: 'وزن الجسم', targetSets: 3, targetRepsLow: 30, targetRepsHigh: 60 },
  { name: 'Cable Crunch', nameAr: 'كرنش كابل', muscle: 'abs', machine: 'Cable Machine', machineAr: 'جهاز الكابل', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 20 },
  { name: 'Hanging Leg Raise', nameAr: 'رفع الأرجل معلق', muscle: 'abs', machine: 'Pull-up Bar', machineAr: 'بار العقلة', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Crunches', nameAr: 'بطن', muscle: 'abs', machine: 'Bodyweight / Mat', machineAr: 'وزن الجسم / مرتبة', targetSets: 3, targetRepsLow: 15, targetRepsHigh: 25 },
  { name: 'Russian Twist', nameAr: 'التواء روسي', muscle: 'abs', machine: 'Weight Plate', machineAr: 'وزن', targetSets: 3, targetRepsLow: 20, targetRepsHigh: 30 },
];
