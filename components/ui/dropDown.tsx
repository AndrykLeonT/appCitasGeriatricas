import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DropdownItem {
  label: string;
  value: string;
}

interface FormDropdownProps {
  label: string;
  placeholder: string;
  data: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
}

export const FormDropdown = ({
  label,
  placeholder,
  data,
  value,
  onChange,
}: FormDropdownProps) => {
  const [visible, setVisible] = useState(false);
  const selectedItem = data.find((item) => item.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text style={[styles.text, !selectedItem && styles.placeholder]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 15 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FFF",
  },
  text: { fontSize: 16, color: "#212529" },
  placeholder: { color: "#ADB5BD" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 250,
    elevation: 5,
  },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F3F5" },
  optionText: { fontSize: 16, color: "#495057" },
  optionTextSelected: { color: "#0056D2", fontWeight: "bold" },
});
