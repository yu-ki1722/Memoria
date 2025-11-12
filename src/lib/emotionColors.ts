export const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case "😊":
      return {
        bg: "bg-[#FFF8E1]",
        accent: "text-[#F59E0B]",
      };
    case "😂":
      return {
        bg: "bg-[#FEF3C7]",
        accent: "text-[#FB923C]",
      };
    case "😍":
      return {
        bg: "bg-[#FCE7F3]",
        accent: "text-[#EC4899]",
      };
    case "😢":
      return {
        bg: "bg-[#DBEAFE]",
        accent: "text-[#3B82F6]",
      };
    case "😮":
      return {
        bg: "bg-[#D1FAE5]",
        accent: "text-[#10B981]",
      };
    case "🤔":
      return {
        bg: "bg-[#EDE9FE]",
        accent: "text-[#8B5CF6]",
      };
    default:
      return {
        bg: "bg-white",
        accent: "text-gray-600",
      };
  }
};
