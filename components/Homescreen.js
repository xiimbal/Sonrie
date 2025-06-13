import React, { useState, useEffect, useCallback, useRoute } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PacientesScreen = () => {
  const { IdSesion } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const navigation = useNavigation();

  const isValidUrl = (url) => typeof url === 'string' && url.startsWith('http');

  const decodeXmlEntities = (str) => {
    if (!str) return str;
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'");
  };

  const fetchPatientsFromWebService = useCallback(async () => {
    if (!IdSesion) {
      Alert.alert('Error', 'No se proporcionó IdSesion.');
      return;
    }

    const soapBody = `
      <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:urn="urn:explorar">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:buscarLugares soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <latitud xsi:type="xsd:float">0</latitud>
            <longitud xsi:type="xsd:float">0</longitud>
            <radio xsi:type="xsd:float">0</radio>
            <TipoCliente xsi:type="xsd:int">0</TipoCliente>
            <pagina xsi:type="xsd:int">1</pagina>
            <IdSesion xsi:type="xsd:string">${IdSesion}</IdSesion>
            <IdEjecutivos xsi:type="xsd:string"></IdEjecutivos>
            <TipoEjecutivos xsi:type="xsd:int">0</TipoEjecutivos>
            <MostrarLocalidades xsi:type="xsd:int">0</MostrarLocalidades>
          </urn:buscarLugares>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      const response = await fetch(
        'http://pakal.factury.mx/wspakal/Explorar2.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: 'urn:explorar#buscarLugares',
          },
          body: soapBody,
        }
      );

      const responseText = await response.text();
      const match = responseText.match(/<return[^>]*>([\s\S]*?)<\/return>/);

      if (match && match[1]) {
        const rawReturn = decodeXmlEntities(match[1].trim());

        if (rawReturn.startsWith('[') && rawReturn.endsWith(']')) {
          try {
            const parsed = JSON.parse(rawReturn);
            if (Array.isArray(parsed)) {
              const filtered = parsed.map(({ NombreNegocio, TipoCliente }) => ({
                NombreNegocio,
                TipoCliente,
                IdSesion,
              }));
              setPatients(filtered);
            } else {
              console.warn('Parsed result is not an array');
              setPatients([]);
            }
          } catch (error) {
            console.error('Error al parsear JSON:', error);
            setPatients([]);
          }
        } else {
          console.warn('Contenido del return no es un array');
          setPatients([]);
        }
      } else {
        console.warn('No se encontró el contenido de <return>');
        setPatients([]);
      }
    } catch (error) {
      console.error('Error al llamar web service:', error);
      setPatients([]);
    }
  }, [IdSesion]);

  useEffect(() => {
    fetchPatientsFromWebService();
  }, [fetchPatientsFromWebService]);

  const filteredPatients = patients.filter((p) =>
    p.NombreNegocio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = async (newPatient) => {
    if (!newPatient?.NombreNegocio) {
      Alert.alert('Error', 'El paciente debe tener un nombre válido.');
      return;
    }
    const updated = [...patients, newPatient];
    setPatients(updated);
  };

  const handleDeletePatient = (patientToDelete) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar a ${patientToDelete.NombreNegocio}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          onPress: () => {
            setPatients(patients.filter((p) => p !== patientToDelete));
            Alert.alert('Paciente eliminado');
          },
        },
      ]
    );
  };

  const handlePatientClick = (patient) => {
    navigation.navigate('PacienteDetailscreen', { patient });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pacientes</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar paciente"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('NewPaciente', { addPatient: handleAddPatient })
          }>
          <Image
            style={styles.addIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/ffffff/add-user-male.png',
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.patientsContainer}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient, index) => (
            <View key={patient.IdSesion + index} style={styles.patientCard}>
              <TouchableOpacity
                onPress={() => handlePatientClick(patient)}
                style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={styles.patientImage}
                    source={{
                      uri: isValidUrl(patient.patientImage)
                        ? patient.patientImage
                        : 'https://via.placeholder.com/150',
                    }}
                  />
                  <Text style={[styles.patientName, { marginLeft: 10 }]}>
                    {patient.NombreNegocio}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePatient(patient)}>
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noPatientsText}>No se encontraron pacientes</Text>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Image
            style={styles.navIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/000000/user.png',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Clock', { patients })}>
          <Image
            style={styles.navIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/000000/calendar.png',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Tratamiento')}>
          <Image
            style={styles.navIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/000000/tooth.png',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => Alert.alert('Función en desarrollo')}>
          <Image
            style={styles.navIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/000000/document.png',
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // (tu objeto styles igual que antes)
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  patientsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  patientName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noPatientsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eaeaea',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});

export default PacientesScreen;
