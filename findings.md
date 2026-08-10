# 发现记录

- 当前教研详情主实现位于 `src/components/ResearchDetail.vue`，流程以 `currentStage` 控制标签可用性。
- 编辑页位于 `src/components/ResearchEditor.vue`；素材上传与 AI 建议样式需在该页处理。
- 当前详情有“教研主题、在线研讨、现场记录、成果文件”横向标签，现场记录与成果页存在录音、会议纪要和归档逻辑。
- 用户明确要求：教研记录与现场记录并行，会议纪要是成果文件组成，新增 AI 会议评价。
