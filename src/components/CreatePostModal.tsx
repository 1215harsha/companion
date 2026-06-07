import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Dumbbell, Video, BarChart2, X } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View 
          entering={SlideInDown.springify().damping(15)} 
          exiting={SlideOutDown.duration(200)}
          style={styles.sheetContainer}
        >
          <Pressable style={styles.sheetContent}>
            <View style={styles.handleBar} />
            <View style={styles.header}>
              <Text style={TYPOGRAPHY.h2}>Create</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={COLORS.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton}>
                <View style={styles.iconContainer}>
                  <Dumbbell color={COLORS.background} size={24} />
                </View>
                <Text style={styles.optionText}>Log PR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionButton}>
                <View style={styles.iconContainer}>
                  <Video color={COLORS.background} size={24} />
                </View>
                <Text style={styles.optionText}>Upload Clip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionButton}>
                <View style={styles.iconContainer}>
                  <BarChart2 color={COLORS.background} size={24} />
                </View>
                <Text style={styles.optionText}>Track Volume</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Numpad Placeholder for rapid entry */}
            <View style={styles.numpadPreview}>
              <Text style={TYPOGRAPHY.caption}>Quick Input Mode Ready</Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetContent: {
    flex: 1,
    padding: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  numpadPreview: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  }
});
