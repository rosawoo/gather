export type TokenPackId = 1 | 3;

export type TokenPack = {
  pack: TokenPackId;
  tokens: number;
  amountCents: number;
  priceLabel: string;
  perTokenLabel: string;
  description: string;
  tag?: string;
  highlight?: boolean;
};

export const TOKEN_PACKS: readonly TokenPack[] = [
  {
    pack: 1,
    tokens: 1,
    amountCents: 1000,
    priceLabel: "$10",
    perTokenLabel: "$10 per token",
    description: "1 Gather token, shared costs for gatherings",
  },
  {
    pack: 3,
    tokens: 3,
    amountCents: 2600,
    priceLabel: "$26",
    perTokenLabel: "~$8.67 per token",
    description: "3 Gather tokens, shared costs for gatherings",
    tag: "Best value",
    highlight: true,
  },
];

export function getTokenPack(pack: number): TokenPack | undefined {
  return TOKEN_PACKS.find((p) => p.pack === pack);
}
