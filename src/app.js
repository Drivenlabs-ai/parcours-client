import { initialFeedbacks, statuses } from './feedbacks.js';

const storageKey = 'portail-feedback.v1';
const list = document.querySelector('#feedbacks');
const count = document.querySelector('#count');
const form = document.querySelector('#feedback-form');
const input = document.querySelector('#feedback-text');
const notice = document.querySelector('#notice');
const storageMessage = document.querySelector('#storage-message');

function readFeedbacks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved) && saved.every(item => item && typeof item.id === 'string' && typeof item.text === 'string' && item.text.trim() && item.text.length <= 500 && statuses.includes(item.status))) return saved;
  } catch { /* Une sauvegarde illisible repart des exemples. */ }
  return structuredClone(initialFeedbacks);
}

let feedbacks = readFeedbacks();

function render() {
  list.replaceChildren();
  count.textContent = `${feedbacks.length} retour${feedbacks.length > 1 ? 's' : ''}`;
  for (const item of feedbacks) {
    const row = document.createElement('li');
    const text = document.createElement('p');
    text.textContent = item.text;
    const status = document.createElement('span');
    status.className = `status status-${statuses.indexOf(item.status)}`;
    status.textContent = item.status;
    row.append(text, status);
    list.append(row);
  }
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(feedbacks));
    storageMessage.hidden = true;
  } catch {
    storageMessage.textContent = 'Votre navigateur ne permet pas la sauvegarde. Vos retours restent disponibles pendant cette visite.';
    storageMessage.hidden = false;
  }
  render();
}

input.addEventListener('input', () => input.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.setCustomValidity('Écrivez votre retour avant de l’envoyer.');
    input.reportValidity();
    return;
  }
  feedbacks.unshift({ id: crypto.randomUUID(), text, status: 'À étudier' });
  save();
  form.reset();
  notice.textContent = 'Votre retour a été ajouté.';
});

document.querySelector('#restart').addEventListener('click', () => {
  feedbacks = structuredClone(initialFeedbacks);
  save();
  form.reset();
  input.setCustomValidity('');
  notice.textContent = 'Les exemples de départ sont rétablis.';
});

render();
