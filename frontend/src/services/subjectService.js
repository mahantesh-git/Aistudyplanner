import { getSubjects, createSubject, getSubject, updateSubject, deleteSubject } from '../api/subjects';

const subjectService = {
  getAll: () => getSubjects(),
  getById: (id) => getSubject(id),
  create: (data) => createSubject(data),
  update: (id, data) => updateSubject(id, data),
  delete: (id) => deleteSubject(id),
};

export default subjectService;
