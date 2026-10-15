// Project duplication utility

import { Project } from '../types';
import { v4 as uuid } from 'uuid';

export function duplicateProject(project: Project): Project {
  const timestamp = new Date().toISOString();
  
  // Deep clone the project
  const cloned: Project = JSON.parse(JSON.stringify(project));
  
  // Generate new IDs for the project
  cloned.id = uuid();
  cloned.name = `${project.name} (Copy)`;
  cloned.createdAt = timestamp;
  cloned.updatedAt = timestamp;
  
  // Regenerate all nested IDs
  cloned.pages = cloned.pages.map(page => ({
    ...page,
    id: uuid(),
    sections: page.sections.map(section => ({
      ...section,
      id: uuid(),
      rows: section.rows.map(row => ({
        ...row,
        id: uuid(),
        columns: row.columns.map(column => ({
          ...column,
          id: uuid(),
          components: column.components.map(component => ({
            ...component,
            id: uuid(),
          })),
        })),
      })),
    })),
  }));
  
  cloned.menus = cloned.menus.map(menu => ({
    ...menu,
    id: uuid(),
    items: regenerateMenuItems(menu.items),
  }));
  
  cloned.forms = cloned.forms.map(form => ({
    ...form,
    id: uuid(),
    fields: form.fields.map(field => ({
      ...field,
      id: uuid(),
    })),
  }));
  
  cloned.media = cloned.media.map(asset => ({
    ...asset,
    id: uuid(),
  }));
  
  cloned.versions = []; // Don't copy versions
  
  return cloned;
}

function regenerateMenuItems(items: any[]): any[] {
  return items.map(item => ({
    ...item,
    id: uuid(),
    children: item.children ? regenerateMenuItems(item.children) : [],
  }));
}

export async function duplicateProjectAsync(project: Project): Promise<Project> {
  // Simulate async operation (for future server-side duplication)
  await new Promise(resolve => setTimeout(resolve, 500));
  return duplicateProject(project);
}
