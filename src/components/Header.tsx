import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
};

const Header = ({ title, showBackButton = true }: HeaderProps) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
         <Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '600' }}>{title}</Text>
      </View>

      <View style={styles.sideContainer} />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    // backgroundColor: 'red'
  },
  sideContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
