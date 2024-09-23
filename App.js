import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/Homescreen';
import ClockScreen from './components/Clockscreen';
import TratamientoScreen from './components/Tratamientoscreen';
import NewPacienteScreen from './components/NewPacientescreen';
import PacienteDetail from './components/PacienteDetailscreen';
import loginscreen from './components/loginscreen';
import registroscreen from './components/registroscreen';
import Notescreen from './components/Notescreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen name=" " component={loginscreen} />
        <Stack.Screen name="registro" component={registroscreen} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false,}} />
        <Stack.Screen name="Clock" component={ClockScreen} options={{ headerShown: false,}} />
        <Stack.Screen name="Note" component={Notescreen} />
        <Stack.Screen name="Tratamiento" component={TratamientoScreen} options={{ headerShown: false,}} />
        <Stack.Screen name="NewPaciente" component={NewPacienteScreen} />
        <Stack.Screen name="PacienteDetailscreen" component={PacienteDetail} options={{ headerShown: false,}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
