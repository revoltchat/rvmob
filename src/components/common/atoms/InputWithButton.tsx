import {useContext, useState} from 'react';
import {StyleSheet, TextInput, View, ViewStyle} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Button} from '@rvmob/components/common/atoms/Button';
import {Text} from '@rvmob/components/common/atoms/Text';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';
import {showToast} from '@rvmob/lib/utils';

export function InputWithButton({
  defaultValue,
  placeholder,
  buttonContents,
  extraStyles,
  backgroundColor,
  onPress,
  skipIfSame,
  cannotBeEmpty,
  emptyError,
  ...props
}: {
  defaultValue?: string;
  placeholder?: string;
  buttonContents:
    | {type: 'string'; content: string}
    | {type: 'icon'; name: string; pack: 'regular' | 'community'};

  extraStyles?: {container?: ViewStyle; input?: ViewStyle; button?: ViewStyle};
  backgroundColor?: ViewStyle['backgroundColor'];
  onPress: any;
  skipIfSame?: boolean;
  cannotBeEmpty?: boolean;
  emptyError?: string;
}) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  let [value, setValue] = useState(defaultValue);
  return (
    // style.input and style.button are applied to the input and button respectively
    <View style={[localStyles.iwbContainer, extraStyles?.container]}>
      <TextInput
        value={value}
        onChangeText={v => {
          setValue(v);
        }}
        placeholder={placeholder}
        style={[
          localStyles.iwbInput,
          backgroundColor ? {backgroundColor} : undefined,
          extraStyles?.input,
        ]}
        {...props}
      />
      <Button
        onPress={() => {
          if (!value && cannotBeEmpty) {
            showToast(emptyError!);
          } else {
            if (!skipIfSame || (skipIfSame && value !== defaultValue)) {
              onPress(value);
            }
          }
        }}
        style={[
          {marginRight: 0},
          backgroundColor ? {backgroundColor} : {},
          extraStyles?.button,
        ]}>
        {buttonContents.type === 'string' ? (
          <Text style={{color: currentTheme.foregroundPrimary}}>
            {buttonContents.content}
          </Text>
        ) : buttonContents.pack === 'regular' ? (
          <MaterialIcon
            name={buttonContents.name}
            color={currentTheme.foregroundPrimary}
            size={20}
          />
        ) : (
          <MaterialCommunityIcon
            name={buttonContents.name}
            color={currentTheme.foregroundPrimary}
            size={20}
          />
        )}
      </Button>
    </View>
  );
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    iwbContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '100%',
    },
    iwbInput: {
      fontFamily: 'Open Sans',
      flex: 1,
      borderRadius: commonValues.sizes.medium,
      backgroundColor: currentTheme.backgroundSecondary,
      padding: 6,
      paddingHorizontal: 10,
      color: currentTheme.foregroundPrimary,
    },
  });
};
