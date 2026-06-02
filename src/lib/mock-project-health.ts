export interface ProjectHealthMetrics {
  passRate: {
    value: number; // 0-100 percentage
    label: string;
    status: "success" | "warning" | "error";
  };
  issuesTrend: {
    opened: number;
    closed: number;
    period: "today" | "this_week";
  };
}

export const MOCK_PROJECT_HEALTH: Record<string, ProjectHealthMetrics> = {
  default: {
    passRate: {
      value: 84,
      label: "Pass rate",
      status: "success",
    },
    issuesTrend: {
      opened: 3,
      closed: 1,
      period: "today",
    },
  },
  warning: {
    passRate: {
      value: 62,
      label: "Pass rate",
      status: "warning",
    },
    issuesTrend: {
      opened: 8,
      closed: 2,
      period: "today",
    },
  },
  empty: {
    passRate: {
      value: 0,
      label: "Pass rate",
      status: "warning",
    },
    issuesTrend: {
      opened: 0,
      closed: 0,
      period: "today",
    },
  },
};
