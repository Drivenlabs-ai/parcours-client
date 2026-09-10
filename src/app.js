import { parcours, initialCompleted } from './parcours.js';

const storageKey = 'parcours-client.v1';
const list = document.querySelector('#steps');
const progress = document.querySelector('#progress');
const progressLabel = document.querySelector('#progress-label');
const next = document.querySelector('#next');
const complete = document.querySelector('#complete');
const storageMessage = document.querySelector('#storage-message');

function readCompleted() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) return new Set(saved.filter(id => parcours.some(step => step.id === id)));
  } catch { /* Une sauvegarde illisible repart de l'état initial. */ }
  return new Set(initialCompleted);
}

let completed = readCompleted();

function render() {
  const current = parcours.find(step => !completed.has(step.id));
  list.replaceChildren();
  for (const [index, step] of parcours.entries()) {
    const done = completed.has(step.id);
    const active = step === current;
    const row = document.createElement('li');
    row.className = done ? 'done' : active ? 'active' : '';
    if (active) row.setAttribute('aria-current', 'step');

    const number = document.createElement('span');
    number.className = 'step-number';
    number.textContent = done ? '✓' : String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = step.title;
    const description = document.createElement('p');
    description.textContent = step.description;
    content.append(title, description);
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = done ? 'Terminée' : active ? 'En cours' : 'À venir';
    row.append(number, content, status);
    list.append(row);
  }
  progress.max = parcours.length;
  progress.value = completed.size;
  progressLabel.textContent = `${completed.size} sur ${parcours.length}`;
  next.textContent = current ? `Prochaine action : ${current.description}` : 'Votre parcours est terminé. Merci !';
  complete.hidden = !current;
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    storageMessage.hidden = true;
  } catch {
    storageMessage.textContent = 'Votre navigateur ne permet pas de sauvegarder la progression. Elle restera disponible pendant cette visite.';
    storageMessage.hidden = false;
  }
  render();
}

complete.addEventListener('click', () => {
  const current = parcours.find(step => !completed.has(step.id));
  if (current) completed.add(current.id);
  save();
  if (complete.hidden) document.querySelector('#restart').focus();
});

document.querySelector('#restart').addEventListener('click', () => {
  completed = new Set(initialCompleted);
  save();
});

render();
