import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import Fontisto from '@expo/vector-icons/Fontisto';

type ToDo = {
  text: string;
  working: boolean;
};
type ToDoList = {
  [key: string]: ToDo;
};

const STORAGE_KEY = '@toDos';
const MODE_KEY = '@previousMode';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState<ToDoList>({});

  useEffect(() => {
    loadToDos();
    loadPreviousMode(); // 챌린지 1: 마지막의 working 상태를 복원하여 표시하시오. (Work 모드인지 Travel 모드인지)
  }, []);

  const travel = () => {
    setWorking(false);
    saveCurrentMode(false);
  };
  const work = () => {
    setWorking(true);
    saveCurrentMode(true);
  };
  const onChangeText = (payload: string) => setText(payload);
  const saveToDos = async (toSave: ToDoList) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      // saving error
    }
  };
  const saveCurrentMode = async (bool: boolean) => {
    try {
      await AsyncStorage.setItem(MODE_KEY, JSON.stringify(bool));
    } catch (e) {
      // saving error
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s !== null) {
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      // error reading value
    }
  };
  const addToDo = async () => {
    if (text === '') return;

    // save to do
    const newToDos: ToDoList = Object.assign({}, toDos, {
      [Date.now()]: { text, working },
    });
    setToDos(newToDos);
    await saveToDos(newToDos);

    // clear input
    setText('');
  };
  const deleteToDo = (key: string) => {
    Alert.alert('Delete To Do', 'Are you sure?', [
      {
        text: 'Cancel',
      },
      {
        text: `I'm Sure`,
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const loadPreviousMode = async () => {
    try {
      const previousMode = await AsyncStorage.getItem(MODE_KEY);
      if (previousMode !== null) {
        setWorking(previousMode === 'true');
      }
    } catch (e) {
      // error reading value
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? 'white' : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        style={styles.input}
        placeholder={working ? 'Add a To do' : 'Where do you want to go?'}
        value={text}
        returnKeyType="done"
      />

      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              <Text style={styles.todoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null,
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    marginTop: 100,
    justifyContent: 'space-between',
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 500,
  },
});
