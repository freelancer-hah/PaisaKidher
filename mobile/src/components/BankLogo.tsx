import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getBankPreset } from '../lib/bankPresets';
import { Building2 } from 'lucide-react-native';

const BANK_ICONS: Record<string, any> = {
  jazzcash: require('../../assets/banks/jazzcash.png'),
  easypaisa: require('../../assets/banks/easypaisa.png'),
  sadapay: require('../../assets/banks/sadapay.png'),
  nayapay: require('../../assets/banks/nayapay.png'),
  meezan: require('../../assets/banks/meezan.png'),
  hbl: require('../../assets/banks/hbl.png'),
  ubl: require('../../assets/banks/ubl.png'),
  alfalah: require('../../assets/banks/alfalah.png'),
  mcb: require('../../assets/banks/mcb.png'),
  allied: require('../../assets/banks/allied.png'),
  scb: require('../../assets/banks/scb.png'),
  faysal: require('../../assets/banks/faysal.png'),
  askari: require('../../assets/banks/askari.png'),
  bop: require('../../assets/banks/bop.png'),
  habibmetro: require('../../assets/banks/habibmetro.png'),
  js: require('../../assets/banks/js.png'),
  soneri: require('../../assets/banks/soneri.png'),
  dib: require('../../assets/banks/dib.png'),
  cash: require('../../assets/banks/cash.png'),
  other: require('../../assets/banks/other.png'),
};

interface BankLogoProps {
  bankKey?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankKey = 'other', size = 'md' }) => {
  const preset = getBankPreset(bankKey);
  const iconSource = BANK_ICONS[preset.id] || BANK_ICONS['other'];

  const dimensions = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const radius = dimensions / 3.2;

  if (iconSource) {
    return (
      <View
        style={[
          styles.container,
          {
            width: dimensions,
            height: dimensions,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={iconSource}
          style={{
            width: dimensions,
            height: dimensions,
            borderRadius: radius,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: radius,
          backgroundColor: preset.bgColor,
        },
      ]}
    >
      <Building2 size={dimensions * 0.45} color={preset.textColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
