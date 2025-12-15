import type { BusinessType } from "@/types";

export interface CampaignDraft {
  title: string;
  copy: string;
  imagePrompt: string; // Descrição para uma futura IA de imagem ou seleção de banco de imagens
  suggestedDiscount: number;
  tags: string[];
}

export type InsightType =
  | "rainy_day"
  | "slow_sales"
  | "peak_hour"
  | "holiday"
  | "low_ticket"
  | "churn_risk";

export class CreativeAIService {
  static generateCampaign(
    insightType: InsightType,
    businessType: BusinessType,
    productName: string = "nosso destaque",
  ): CampaignDraft {
    // Em um cenário real, aqui chamaríamos uma API de LLM (OpenAI, Gemini)
    // Por enquanto, usamos "Templates Inteligentes" para simular a criatividade

    const templates = this.getTemplates(insightType, businessType, productName);
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return randomTemplate;
  }

  private static getTemplates(
    type: InsightType,
    business: BusinessType,
    product: string,
  ): CampaignDraft[] {
    // Base de Conhecimento Criativa (Simulada)

    if (type === "rainy_day") {
      return [
        {
          title: "Chuva de Sabores! ☔",
          copy: `O tempo fechou? O preço também! Peça ${product} com entrega grátis e curta o barulhinho da chuva no conforto de casa. 🏠❤️`,
          imagePrompt: "cozy food rainy window",
          suggestedDiscount: 0,
          tags: ["delivery", "conforto"],
        },
        {
          title: "Esqueceu o guarda-chuva? 🌧️",
          copy: `Não se molhe! Nós levamos ${product} até você. Peça agora e ganhe uma bebida quente para acompanhar! ☕`,
          imagePrompt: "delivery man rain",
          suggestedDiscount: 10,
          tags: ["delivery", "promo"],
        },
      ];
    }

    if (type === "slow_sales") {
      return [
        {
          title: "O Patrão Ficou Louco! 🤪",
          copy: `Só hoje! ${product} com um desconto que a gente não via há tempos. Corre antes que ele mude de ideia! 🏃💨`,
          imagePrompt: "crazy sale sign",
          suggestedDiscount: 20,
          tags: ["urgencia", "desconto"],
        },
        {
          title: "Saudades de você... 💔",
          copy: `Faz tempo que não te vemos! Que tal um ${product} hoje para matar a saudade? Tem cupom especial te esperando.`,
          imagePrompt: "miss you card",
          suggestedDiscount: 15,
          tags: ["retencao", "afetivo"],
        },
      ];
    }

    if (type === "holiday") {
      return [
        {
          title: "Feriado Chegando! 🎉",
          copy: `Já planejou seu feriado? Garanta seu ${product} antecipado e não fique na mão. Reservas abertas!`,
          imagePrompt: "holiday celebration",
          suggestedDiscount: 5,
          tags: ["antecipacao", "feriado"],
        },
      ];
    }

    // Default genérico
    return [
      {
        title: `Oferta Especial de ${product} ✨`,
        copy: `Você merece o melhor! Experimente nosso ${product} preparado com todo carinho. Peça já!`,
        imagePrompt: "generic product high quality",
        suggestedDiscount: 10,
        tags: ["institucional"],
      },
    ];
  }
}
