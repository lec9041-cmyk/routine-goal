import { useState } from "react";
import { X, Plus, Folder, Edit2, Trash2, Calendar } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Project } from "../context/DataContext";
import { ModalPortal } from "./common/ModalPortal";

interface ProjectManageModalProps {
  onClose: () => void;
}

const projectColors = [
  { name: "빨강", class: "bg-gradient-to-br from-red-100 to-red-200" },
  { name: "주황", class: "bg-gradient-to-br from-orange-100 to-orange-200" },
  { name: "노랑", class: "bg-gradient-to-br from-yellow-100 to-yellow-200" },
  { name: "초록", class: "bg-gradient-to-br from-green-100 to-green-200" },
  { name: "파랑", class: "bg-gradient-to-br from-blue-100 to-blue-200" },
  { name: "보라", class: "bg-gradient-to-br from-purple-100 to-purple-200" },
  { name: "분홍", class: "bg-gradient-to-br from-pink-100 to-pink-200" },
  { name: "회색", class: "bg-gradient-to-br from-gray-100 to-gray-200" },
];
const compactDateInputClass = "w-full max-w-[12.5rem] px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[12px]";

export function ProjectManageModal({ onClose }: ProjectManageModalProps) {
  const { projects, addProject, updateProject, deleteProject, todos } = useData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: "",
    color: projectColors[4].class,
    category: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      color: newProject.color,
      category: newProject.category || undefined,
      startDate: newProject.startDate || undefined,
      endDate: newProject.endDate || undefined,
      description: newProject.description || undefined,
    };

    addProject(project);
    setNewProject({
      title: "",
      color: projectColors[4].class,
      category: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !editingProject.title.trim()) return;

    updateProject(editingProject.id, editingProject);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    const projectTodos = todos.filter(t => t.projectId === projectId);
    
    if (projectTodos.length > 0) {
      if (!confirm(`이 프로젝트에는 ${projectTodos.length}개의 할일이 있습니다.\n삭제하시겠습니까? (할일은 유지되지만 프로젝트 연결이 해제됩니다)`)) {
        return;
      }
    }
    
    deleteProject(projectId);
  };

  const getProjectTodoCount = (projectId: string) => {
    return todos.filter(t => t.projectId === projectId).length;
  };

  const getProjectProgress = (projectId: string) => {
    const projectTodos = todos.filter(t => t.projectId === projectId);
    if (projectTodos.length === 0) return 0;
    const completed = projectTodos.filter(t => t.completed).length;
    return Math.round((completed / projectTodos.length) * 100);
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewProject({
      title: "",
      color: projectColors[4].class,
      category: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <ModalPortal>
    <div className="modal-backdrop z-[1200] bg-black/50 flex items-end justify-center">
      <div className="modal-sheet z-[1201] bg-white rounded-t-3xl w-full max-w-md h-[min(90dvh,760px)] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            프로젝트 관리
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4 overscroll-contain">
          {/* Add Project Button */}
          {!showAddForm && !editingProject && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              새 프로젝트 추가
            </button>
          )}

          {/* Add Project Form */}
          {showAddForm && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                프로젝트 이름
              </label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="프로젝트 이름을 입력하세요"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                색상
              </label>
              <div className="grid grid-cols-4 gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setNewProject({ ...newProject, color: color.class })}
                    className={`h-10 rounded-lg ${color.class} ${
                      newProject.color === color.class ? "ring-2 ring-blue-500 ring-offset-2" : ""
                    } transition-all`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className={compactDateInputClass}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className={compactDateInputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                설명 (선택)
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="프로젝트 설명"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px] resize-none"
                rows={2}
              />
            </div>

          </div>
          )}

          {/* Edit Project Form */}
          {editingProject && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                프로젝트 이름
              </label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                색상
              </label>
              <div className="grid grid-cols-4 gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setEditingProject({ ...editingProject, color: color.class })}
                    className={`h-10 rounded-lg ${color.class} ${
                      editingProject.color === color.class ? "ring-2 ring-blue-500 ring-offset-2" : ""
                    } transition-all`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={editingProject.startDate || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  className={compactDateInputClass}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={editingProject.endDate || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  className={compactDateInputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                설명 (선택)
              </label>
              <textarea
                value={editingProject.description || ""}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                placeholder="프로젝트 설명"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px] resize-none"
                rows={2}
              />
            </div>

          </div>
          )}

          {/* Project List */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold text-gray-700 mb-2">
              프로젝트 목록 ({projects.length})
            </h3>
          
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-[13px]">등록된 프로젝트가 없습니다</p>
            </div>
          ) : (
            projects.map((project) => {
              const todoCount = getProjectTodoCount(project.id);
              const progress = getProjectProgress(project.id);

              return (
                <div
                  key={project.id}
                  className={`${project.color} rounded-xl p-3 border border-white/80 shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-gray-800 mb-0.5">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="text-[11px] text-gray-600 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="w-7 h-7 rounded-lg bg-white/70 hover:bg-white flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-7 h-7 rounded-lg bg-white/70 hover:bg-white flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {project.startDate && (
                          <span>{new Date(project.startDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                        )}
                        {project.startDate && project.endDate && <span>~</span>}
                        {project.endDate && (
                          <span>{new Date(project.endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-600 font-medium">
                        할일 {todoCount}개
                      </span>
                      <span className="text-[11px] text-gray-800 font-bold">
                        {progress}% 완료
                      </span>
                    </div>
                    
                    {todoCount > 0 && (
                      <div className="w-full bg-white/50 rounded-full h-1.5">
                        <div
                          className="bg-gray-800 rounded-full h-1.5 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {(showAddForm || editingProject) && (
          <div className="shrink-0 sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur px-6 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              <button
                onClick={showAddForm ? handleAddProject : handleUpdateProject}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all text-[13px]"
              >
                {showAddForm ? "추가" : "수정"}
              </button>
              <button
                onClick={showAddForm ? resetAddForm : () => setEditingProject(null)}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all text-[13px]"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}
