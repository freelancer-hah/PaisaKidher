import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#f0fdf4';
        const borderColor = isSuccess ? '#a7f3d0' : isError ? '#fecaca' : '#bbf7d0';
        const textColor = isSuccess ? '#065f46' : isError ? '#991b1b' : '#166534';

        return (
          <View
            key={toast.id}
            style={[styles.toastCard, { backgroundColor: bgColor, borderColor }]}
          >
            <View style={styles.iconContainer}>
              {isSuccess ? (
                <CheckCircle2 size={20} color="#059669" />
              ) : isError ? (
                <AlertCircle size={20} color="#dc2626" />
              ) : (
                <Info size={20} color="#16a34a" />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: textColor }]}>{toast.title}</Text>
              <Text style={styles.message} numberOfLines={2}>
                {toast.message}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onDismiss(toast.id)} style={styles.closeBtn}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 11,
    color: '#475569',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
});

