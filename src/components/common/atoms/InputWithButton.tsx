import React from 'react';
import {StyleSheet, TextInput, View, ViewStyle} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { showToast } from '../../../lib/utils';
import { currentTheme, styles } from '../../../Theme';
import { Button, Text } from '.';

// TODO: move these once i figure out what to do with the plain Input component/where it'll be useful

// type InputProps = {
//   value?: string;
//   onChangeText?: any;
//   placeholder?: string;
//   style?: any;
//   backgroundColor: ViewStyle['backgroundColor'];
// };

// export function Input({
//   value,
//   onChangeText,
//   placeholder,
//   style,
//   backgroundColor,
//   ...props
// }: InputProps) {
//   return (
//     <TextInput
//       value={value}
//       onChangeText={onChangeText}
//       placeholder={placeholder}
//       style={[
//         {
//           minWidth: '100%',
//           borderRadius: 8,
//           backgroundColor: currentTheme.backgroundSecondary,
//           padding: 6,
//           paddingLeft: 10,
//           paddingRight: 10,
//           color: currentTheme.foregroundPrimary,
//         },
//         backgroundColor ? {backgroundColor} : {},
//         style,
//       ]}
//       {...props}
//     />
//   );
// }

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
    let [value, setValue] = React.useState(defaultValue);
    return (
      // style.input and style.button are applied to the input and button respectively
      <View style={[styles.iwbContainer, extraStyles?.container]}>
        <TextInput
          value={value}
          onChangeText={v => {
            setValue(v);
          }}
          placeholder={placeholder}
          style={[
            styles.iwbInput,
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
            styles.button,
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
