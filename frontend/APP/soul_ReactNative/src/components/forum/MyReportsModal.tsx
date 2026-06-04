import React from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type ReportItem = {
  _id: string;
  targetType: "post" | "comment";
  reason: string;
  description?: string | null;
  status: "pending" | "dismissed" | "action_taken";
  createdAt?: string;
};

type Props = {
  visible: boolean;
  reports: ReportItem[];
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString();
}

export function MyReportsModal({ visible, reports, onClose }: Props) {
  const renderReport = ({ item }: { item: ReportItem }) => {
    return (
      <View style={s.myReportCard}>
        <Text style={s.myReportReason}>
          {item.reason?.replaceAll("_", " ") || "Report"}
        </Text>

        <Text style={s.myReportMeta}>
          {item.targetType?.toUpperCase()} • {item.status}
        </Text>

        {item.description ? (
          <Text style={s.myReportDescription}>{item.description}</Text>
        ) : null}

        {formatDate(item.createdAt) ? (
          <Text style={s.myReportMeta}>{formatDate(item.createdAt)}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.reportBackdrop}>
        <View style={s.reportModal}>
          <Text style={s.reportTitle}>My Reports</Text>

          <Text style={s.reportSub}>Reports you have submitted.</Text>

          {reports.length === 0 ? (
            <Text style={s.emptyReportText}>No reports found.</Text>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item._id}
              renderItem={renderReport}
              style={s.myReportList}
              showsVerticalScrollIndicator={false}
            />
          )}

          <Pressable onPress={onClose}>
            <Text style={s.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}