import LivingEssay from "@/components/LivingEssay";
import Pillars from "@/components/Pillars";
import StrengthsShadows from "@/components/StrengthsShadows";
import FredsFortune from "@/components/FredsFortune";
import { Card } from "@/components/ui/card";

const Insights = () => {
  return (
    <div className="w-[90%] md:w-[80%] py-8 sm:px-4 sm:py-12 mt-16">
      <div className="max-w-6xl mx-auto">
        <LivingEssay />
        <Pillars />
        <StrengthsShadows />
        <FredsFortune />
      </div>
    </div>
  );
};

export default Insights;
