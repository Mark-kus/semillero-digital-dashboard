"use client";

import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

import {useClassroomData} from "../../classroom/contexts/ClassroomDataContext";

interface DashboardOverviewProps {
  userRole: string;
}

export default function DashboardOverview({userRole}: DashboardOverviewProps) {
  const {state} = useClassroomData();

  const getStatsForRole = () => {
    const {dashboardStats} = state;

    if (!dashboardStats) {
      // Datos de fallback mientras se cargan
      if (userRole === "coordinator") {
        return [
          {name: "Estudiantes Activos", value: "-", icon: UserGroupIcon, color: "blue"},
          {name: "Cursos Activos", value: "-", icon: AcademicCapIcon, color: "green"},
          {name: "Tareas Totales", value: "-", icon: ClockIcon, color: "yellow"},
          {name: "Tareas Pendientes", value: "-", icon: ExclamationTriangleIcon, color: "red"},
        ];
      } else if (userRole === "teacher") {
        return [
          {name: "Mis Estudiantes", value: "-", icon: UserGroupIcon, color: "blue"},
          {name: "Mis Cursos", value: "-", icon: AcademicCapIcon, color: "green"},
          {name: "Tareas Asignadas", value: "-", icon: ClockIcon, color: "yellow"},
          {name: "Tasa de Finalización", value: "-", icon: ArrowTrendingUpIcon, color: "green"},
        ];
      } else {
        return [
          {name: "Mis Cursos", value: "-", icon: AcademicCapIcon, color: "blue"},
          {name: "Tareas Completadas", value: "-", icon: CheckCircleIcon, color: "green"},
          {name: "Tareas Pendientes", value: "-", icon: ExclamationTriangleIcon, color: "yellow"},
          {name: "Progreso General", value: "-", icon: ArrowTrendingUpIcon, color: "green"},
        ];
      }
    }

    if (userRole === "coordinator") {
      return [
        {
          name: "Estudiantes Activos",
          value: dashboardStats.activeStudents.toString(),
          icon: UserGroupIcon,
          color: "blue",
        },
        {
          name: "Cursos Activos",
          value: dashboardStats.activeCourses.toString(),
          icon: AcademicCapIcon,
          color: "green",
        },
        {
          name: "Tareas Totales",
          value: dashboardStats.totalAssignments.toString(),
          icon: ClockIcon,
          color: "yellow",
        },
        {
          name: "Tareas Pendientes",
          value: dashboardStats.pendingAssignments.toString(),
          icon: ExclamationTriangleIcon,
          color: "red",
        },
      ];
    } else if (userRole === "teacher") {
      // Para profesores, filtrar datos por sus cursos
      const teacherCourses = state.courseData.filter((course) => course.status === "active");
      const teacherStudents = state.studentProgress.filter((student) =>
        teacherCourses.some((course) => course.id === student.courseId),
      );

      return [
        {
          name: "Mis Estudiantes",
          value: teacherStudents.length.toString(),
          icon: UserGroupIcon,
          color: "blue",
        },
        {
          name: "Mis Cursos",
          value: teacherCourses.length.toString(),
          icon: AcademicCapIcon,
          color: "green",
        },
        {
          name: "Tareas Asignadas",
          value: dashboardStats.totalAssignments.toString(),
          icon: ClockIcon,
          color: "yellow",
        },
        {
          name: "Tasa de Finalización",
          value: `${dashboardStats.completionRate}%`,
          icon: ArrowTrendingUpIcon,
          color: "green",
        },
      ];
    } else {
      // Para estudiantes, mostrar sus datos personales
      const studentCourses = state.courseData.filter((course) => course.status === "active");
      const myProgress = state.studentProgress.find(
        (student) => student.email === state.courses[0]?.ownerId,
      ); // Simplificado

      return [
        {
          name: "Mis Cursos",
          value: studentCourses.length.toString(),
          icon: AcademicCapIcon,
          color: "blue",
        },
        {
          name: "Tareas Completadas",
          value: myProgress?.assignmentsCompleted.toString() || "0",
          icon: CheckCircleIcon,
          color: "green",
        },
        {
          name: "Tareas Pendientes",
          value: (myProgress
            ? myProgress.totalAssignments - myProgress.assignmentsCompleted
            : 0
          ).toString(),
          icon: ExclamationTriangleIcon,
          color: "yellow",
        },
        {
          name: "Progreso General",
          value: `${myProgress?.progress || 0}%`,
          icon: ArrowTrendingUpIcon,
          color: "green",
        },
      ];
    }
  };

  const stats = getStatsForRole();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500 text-blue-600 bg-blue-50",
      green: "bg-green-500 text-green-600 bg-green-50",
      yellow: "bg-yellow-500 text-yellow-600 bg-yellow-50",
      red: "bg-red-500 text-red-600 bg-red-50",
    };

    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h1 className="mb-2 text-3xl font-bold">¡Bienvenido a Semillero Digital!</h1>
        <p className="text-lg text-blue-100">
          {userRole === "coordinator" &&
            "Panel de control para coordinadores - Gestiona estudiantes, profesores y métricas"}
          {userRole === "teacher" &&
            "Panel para profesores - Supervisa el progreso de tus estudiantes"}
          {userRole === "student" &&
            "Tu espacio de aprendizaje - Revisa tu progreso y próximas actividades"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color).split(" ");

          return (
            <div key={stat.name} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${colorClasses[2]}`}>
                  <Icon className={`h-6 w-6 ${colorClasses[1]}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {state.isLoading ? (
              // Skeleton loading
              Array.from({length: 4}).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                  <div className="flex-1">
                    <div className="mb-1 h-4 w-3/4 rounded bg-gray-300" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))
            ) : state.recentActivity.length > 0 ? (
              state.recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "assignment_created"
                        ? "bg-blue-500"
                        : activity.type === "assignment_submitted"
                          ? "bg-green-500"
                          : activity.type === "grade_posted"
                            ? "bg-yellow-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.description} • {activity.courseName} •{" "}
                      {activity.timestamp.toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
