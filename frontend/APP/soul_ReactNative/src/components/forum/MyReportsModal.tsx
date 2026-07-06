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

  return date.toLocaleDateString("vi-VN");
}

function translateTargetType(type: ReportItem["targetType"]) {
  if (type === "post") return "BÀI VIẾT";
  if (type === "comment") return "BÌNH LUẬN";
  return "NỘI DUNG";
}

function translateStatus(status: ReportItem["status"]) {
  if (status === "pending") return "Đang chờ xử lý";
  if (status === "dismissed") return "Đã bỏ qua";
  if (status === "action_taken") return "Đã xử lý";
  return status;
}

export function MyReportsModal({ visible, reports, onClose }: Props) {
  const renderReport = ({ item }: { item: ReportItem }) => {
    return (
      <View style={s.myReportCard}>
        <Text style={s.myReportReason}>
          {item.reason?.replaceAll("_", " ") || "Báo cáo"}
        </Text>

        <Text style={s.myReportMeta}>
          {translateTargetType(item.targetType)} • {translateStatus(item.status)}
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.reportBackdrop}>
        <View style={s.reportModal}>
          <Text style={s.reportTitle}>Báo cáo của tôi</Text>

          <Text style={s.reportSub}>Các báo cáo bạn đã gửi.</Text>

          {reports.length === 0 ? (
            <Text style={s.emptyReportText}>Chưa có báo cáo nào.</Text>
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
            <Text style={s.cancelText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}