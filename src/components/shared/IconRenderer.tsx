import React from 'react';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaidIcon from '@mui/icons-material/Paid';
import SavingsIcon from '@mui/icons-material/Savings';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';

interface IconRendererProps {
  iconName: string;
}

const iconComponents: { [key: string]: React.ElementType } = {
  LocalDrink: LocalDrinkIcon,
  FitnessCenter: FitnessCenterIcon,
  SelfImprovement: SelfImprovementIcon,
  LaptopChromebook: LaptopChromebookIcon,
  MenuBook: MenuBookIcon,
  Paid: PaidIcon,
  Savings: SavingsIcon,
  Restaurant: RestaurantIcon,
  EmojiFoodBeverage: EmojiFoodBeverageIcon,
  Translate: TranslateIcon,
  Person: PersonIcon,
};

const IconRenderer: React.FC<IconRendererProps> = ({ iconName }) => {
  const IconComponent = iconComponents[iconName];
  return IconComponent ? <IconComponent style={{ width: 32, height: 32, marginRight: 12 }} /> : null;
};

export default IconRenderer;
