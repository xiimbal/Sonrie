import React, { useState } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MD5 from 'crypto-js/md5';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onLoginPress = async () => {
    const hashedPassword = MD5(password).toString();

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:autenticausuario">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:autenticaUsuario soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
          <usuario xsi:type="xsd:string">${email}</usuario>
          <password xsi:type="xsd:string">${hashedPassword}</password>
          <IdSessionAnterior xsi:type="xsd:string"></IdSessionAnterior>
        </urn:autenticaUsuario>
      </soapenv:Body>
    </soapenv:Envelope>`;

    try {
      const response = await fetch('http://pakal.factury.mx/wspakal/AutenticaUsuario.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:autenticausuario#autenticaUsuario'
        },
        body: soapRequest
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      const match = responseText.match(/<return[^>]*>(.*?)<\/return>/);

      if (match && match[1]) {
        const unescaped = match[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const jsonData = JSON.parse(unescaped);
        console.log('Datos JSON parseados:', jsonData);

        if (jsonData[0]?.IdUsuario) {
          navigation.navigate('Home', { idSession: jsonData[0].IdSession,
          userData: jsonData[0] });
          } else {
            alert('Credenciales inválidas');
}

      } else {
        alert('Respuesta malformada del servidor');
      }

    } catch (error) {
      console.error('Error de conexión:', error.message);
      alert('No se pudo conectar con el servidor: ' + error.message);
    }
  };

  const onFooterLinkPress = () => {
    navigation.navigate('registro');
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../assets/diente1.png')}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Gmail"
          placeholderTextColor="#aaa"
          onChangeText={(text) => setEmail(text)}
          value={email}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            onChangeText={(text) => setPassword(text)}
            value={password}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggle}>
              {showPassword ? 'Ocultar' : 'Ver'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onLoginPress}>
          <Text style={styles.buttonTitle}>Inicia sesión</Text>
        </TouchableOpacity>

        <View style={styles.footerView}>
          <Text style={styles.footerText}>
            ¿No tienes una cuenta?
            <Text onPress={onFooterLinkPress} style={styles.footerLink}> Inscribirse</Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 300,
    height: 300,
  },
  input: {
    height: 48,
    borderRadius: 5,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    paddingLeft: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#000',
  },
  toggle: {
    color: '#007BFF',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    marginTop: 20,
    height: 48,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerView: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#007BFF',
  },
  footerLink: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
