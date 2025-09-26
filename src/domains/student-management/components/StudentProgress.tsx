"use client";

import {useState, useEffect} from "react";

interface StudentProgressProps {
  userRole: string;
}

interface Course {
  id: string;
  name: string;
  section?: string;
  ownerId: string;
}

interface Student {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    emailAddress: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    photoUrl?: string;
  };
  joinTime?: string;
}

interface StudentData {
  courseId: string;
  totalStudents: number;
  students: Student[];
  summary: {
    studentsWithPhotos: number;
    studentsWithCompleteNames: number;
    emailDomains: string[];
  };
}

export function StudentProgress({}: StudentProgressProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [studentsData, setStudentsData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses();
  }, []);

  // Cargar estudiantes cuando se selecciona un curso
  useEffect(() => {
    if (selectedCourse) {
      loadStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/classroom/courses");
      const data = await response.json();

      if (data.success) {
        setCourses(data.data || []);
        // Seleccionar automáticamente el primer curso si existe
        if (data.data && data.data.length > 0) {
          setSelectedCourse(data.data[0].id);
        }
      } else {
        setError(data.error || "Error al cargar cursos");
      }
    } catch (_err) {
      setError("Error de conexión al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/classroom/students?courseId=${courseId}&detailed=true`);
      const data = await response.json();

      if (data.success) {
        setStudentsData(data);
      } else {
        setError(data.error || "Error al cargar estudiantes");
      }
    } catch (_err) {
      setError("Error de conexión al cargar estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (joinTime?: string) => {
    if (!joinTime) return "No disponible";

    return new Date(joinTime).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEmailDomain = (email: string) => {
    return email.split("@")[1] || "desconocido";
  };

  const selectedCourseInfo = courses.find((c) => c.id === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Alumnos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y visualiza la información de tus estudiantes
          </p>
        </div>
      </div>

      {/* Selector de Curso */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="course-select">
              Seleccionar Curso
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Selecciona un curso...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.section ? `- ${course.section}` : ""}
                </option>
              ))}
            </select>
          </div>
          {selectedCourseInfo && (
            <div className="text-sm text-gray-500">
              <p className="font-medium">Curso seleccionado:</p>
              <p>{selectedCourseInfo.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fillRule="evenodd"
              />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="text-gray-600">Cargando estudiantes...</span>
          </div>
        </div>
      )}

      {/* Estadísticas del Curso */}
      {studentsData && !loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{studentsData.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Foto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentsData.summary.studentsWithPhotos}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nombres Completos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentsData.summary.studentsWithCompleteNames}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                  <svg
                    className="h-5 w-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dominios Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentsData.summary.emailDomains.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Estudiantes */}
      {studentsData && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Estudiantes ({studentsData.totalStudents})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Dominio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Fecha de Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {studentsData.students.map((student) => (
                  <tr key={student.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {student.profile.photoUrl ? (
                            <img
                              alt={student.profile.name.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.profile.photoUrl}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                              <svg
                                className="h-6 w-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.profile.name.fullName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {student.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.profile.emailAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {getEmailDomain(student.profile.emailAddress)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {formatJoinDate(student.joinTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {student.profile.photoUrl && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            📸 Foto
                          </span>
                        )}
                        {student.profile.name.givenName && student.profile.name.familyName && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                            ✓ Completo
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!selectedCourse && !loading && (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Selecciona un curso</h3>
          <p className="mt-1 text-sm text-gray-500">
            Elige un curso para ver la lista de estudiantes y sus detalles.
          </p>
        </div>
      )}
    </div>
  );
}
