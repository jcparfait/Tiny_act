export type BonusChallenge = {
  id: string;
  title: string;
  subtitle: string;
  rewardLabel: string;
  xpBonus: number;
};

export const BONUS_CHALLENGES: BonusChallenge[] = [
  {
    id: "two-15-min",
    title: "Défi 2 × 15 min",
    subtitle:
      "Fais deux activités de 15 min aujourd’hui.",
    rewardLabel: "+10 XP bonus",
    xpBonus: 10,
  },
  {
    id: "three-5-min",
    title: "Sprint 3 × 5 min",
    subtitle:
      "Enchaîne trois petites actions de 5 min.",
    rewardLabel: "+8 XP bonus",
    xpBonus: 8,
  },
  {
    id: "one-code-one-culture",
    title: "Code + culture",
    subtitle:
      "Termine une activité code et une activité culture.",
    rewardLabel: "+12 XP bonus",
    xpBonus: 12,
  },
  {
    id: "morning-action",
    title: "Action du matin",
    subtitle:
      "Termine une activité avant midi.",
    rewardLabel: "+6 XP bonus",
    xpBonus: 6,
  },
  {
    id: "no-scroll-30",
    title: "30 min sans scroll",
    subtitle:
      "Remplace 30 min de scroll par une activité.",
    rewardLabel: "+12 XP bonus",
    xpBonus: 12,
  },
  {
    id: "room-progress",
    title: "Objectif room",
    subtitle:
      "Gagne au moins 20 XP pour ta room aujourd’hui.",
    rewardLabel: "+10 XP bonus",
    xpBonus: 10,
  },
  {
    id: "language-touch",
    title: "Petit langage",
    subtitle:
      "Termine une activité langue aujourd’hui.",
    rewardLabel: "+7 XP bonus",
    xpBonus: 7,
  },
  {
    id: "focus-chain",
    title: "Chaîne de focus",
    subtitle:
      "Termine deux activités sans pause longue.",
    rewardLabel: "+10 XP bonus",
    xpBonus: 10,
  },
  {
    id: "try-something-else",
    title: "Change de thème",
    subtitle:
      "Fais une activité dans un thème peu utilisé.",
    rewardLabel: "+8 XP bonus",
    xpBonus: 8,
  },
  {
    id: "finish-anything",
    title: "Juste une action",
    subtitle:
      "Termine au moins une activité aujourd’hui.",
    rewardLabel: "+5 XP bonus",
    xpBonus: 5,
  },
];

export function getDailyBonusChallenge(
  date = new Date()
): BonusChallenge {
  const startDate = Date.UTC(2026, 0, 1);

  const currentDate = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const daysSinceStart = Math.floor(
    (currentDate - startDate) /
      (1000 * 60 * 60 * 24)
  );

  const index =
    ((daysSinceStart % BONUS_CHALLENGES.length) +
      BONUS_CHALLENGES.length) %
    BONUS_CHALLENGES.length;

  return BONUS_CHALLENGES[index];
}
