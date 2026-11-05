/* ── Blog admin dashboard ── */

const listView = document.getElementById('list-view');
const editorView = document.getElementById('editor-view');
const postsTableBody = document.getElementById('posts-table-body');
const listError = document.getElementById('list-error');
const editorError = document.getElementById('editor-error');
const editorForm = document.getElementById('editor-form');
const editorHeading = document.getElementById('editor-heading');
const viewLiveLink = document.getElementById('view-live-link');

const fieldId = document.getElementById('field-id');
const fieldTitle = document.getElementById('field-title');
const fieldSlug = document.getElementById('field-slug');
const fieldExcerpt = document.getElementById('field-excerpt');
const fieldImageUrl = document.getElementById('field-image-url');
const imagePreview = document.getElementById('image-preview');
const fieldContent = document.getElementById('field-content');
const fieldContentHtml = document.getElementById('field-content-html');
const fieldTags = document.getElementById('field-tags');
const fieldMetaTitle = document.getElementById('field-meta-title');
const fieldMetaDescription = document.getElementById('field-meta-description');
const fieldStatus = document.getElementById('field-status');
const deleteBtn = document.getElementById('delete-btn');

let slugManuallyEdited = false;
let rawHtmlMode = false;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showList() {
  listView.style.display = '';
  editorView.style.display = 'none';
  loadPosts();
}

function showEditor() {
  listView.style.display = 'none';
  editorView.style.display = '';
}

/* ── List ── */

async function loadPosts() {
  listError.textContent = '';
  postsTableBody.innerHTML = '<tr><td colspan="4" class="admin-table-loading">Loading posts…</td></tr>';

  try {
    const res = await fetch('/blog/admin/api/posts');
    if (res.status === 401) { window.location.href = '/blog/admin/login'; return; }
    const posts = await res.json();

    if (!res.ok) {
      postsTableBody.innerHTML = '<tr><td colspan="4" class="admin-table-loading">Could not load posts.</td></tr>';
      return;
    }

    if (!posts.length) {
      postsTableBody.innerHTML = '<tr><td colspan="4" class="admin-table-loading">No posts yet.</td></tr>';
      return;
    }

    postsTableBody.innerHTML = posts.map(post => `
      <tr data-id="${post.id}">
        <td>${escapeText(post.title || '(untitled)')}</td>
        <td><span class="status-badge status-badge--${post.status}">${post.status}</span></td>
        <td>${formatDate(post.published_at || post.created_at)}</td>
        <td class="admin-table-actions">
          <button type="button" class="btn-link edit-post-btn" data-id="${post.id}">Edit</button>
          <button type="button" class="btn-link btn-link--danger delete-post-btn" data-id="${post.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    postsTableBody.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', () => editPost(btn.dataset.id));
    });
    postsTableBody.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', () => deletePostFromList(btn.dataset.id));
    });
  } catch (e) {
    listError.textContent = 'Could not load posts.';
  }
}

async function deletePost(id) {
  if (!window.confirm('Delete this post? This cannot be undone.')) return false;
  try {
    const res = await fetch(`/blog/admin/api/posts/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
    return true;
  } catch (e) {
    listError.textContent = 'Could not delete post.';
    return false;
  }
}

async function deletePostFromList(id) {
  if (await deletePost(id)) loadPosts();
}

/* ── Editor ── */

function resetEditor() {
  fieldId.value = '';
  fieldTitle.value = '';
  fieldSlug.value = '';
  fieldExcerpt.value = '';
  fieldImageUrl.value = '';
  imagePreview.style.display = 'none';
  fieldContent.innerHTML = '';
  fieldContentHtml.value = '';
  fieldTags.value = '';
  fieldMetaTitle.value = '';
  fieldMetaDescription.value = '';
  fieldStatus.value = 'draft';
  slugManuallyEdited = false;
  editorError.textContent = '';
  rawHtmlMode = false;
  fieldContent.style.display = '';
  fieldContentHtml.style.display = 'none';
}

function newPost() {
  resetEditor();
  editorHeading.textContent = 'New Post';
  deleteBtn.style.display = 'none';
  viewLiveLink.style.display = 'none';
  showEditor();
  fieldTitle.focus();
}

async function editPost(id) {
  editorError.textContent = '';
  try {
    const res = await fetch(`/blog/admin/api/posts/${id}`);
    if (res.status === 401) { window.location.href = '/blog/admin/login'; return; }
    const post = await res.json();
    if (!res.ok) { listError.textContent = 'Could not load post.'; return; }
    if (!post) { listError.textContent = 'Post not found.'; return; }

    resetEditor();
    editorHeading.textContent = 'Edit Post';
    fieldId.value = post.id;
    fieldTitle.value = post.title || '';
    fieldSlug.value = post.slug || '';
    slugManuallyEdited = true;
    fieldExcerpt.value = post.excerpt || '';
    fieldImageUrl.value = post.featured_image_url || '';
    if (post.featured_image_url) {
      imagePreview.src = post.featured_image_url;
      imagePreview.style.display = '';
    }
    fieldContent.innerHTML = post.content || '';
    fieldContentHtml.value = post.content || '';
    fieldTags.value = (post.tags || []).join(', ');
    fieldMetaTitle.value = post.meta_title || '';
    fieldMetaDescription.value = post.meta_description || '';
    fieldStatus.value = post.status || 'draft';

    deleteBtn.style.display = '';
    if (post.status === 'published' && post.slug) {
      viewLiveLink.href = `/blog/${post.slug}`;
      viewLiveLink.style.display = '';
    } else {
      viewLiveLink.style.display = 'none';
    }

    showEditor();
  } catch (e) {
    listError.textContent = 'Could not load post.';
  }
}

async function savePost(e) {
  e.preventDefault();
  editorError.textContent = '';

  if (!fieldTitle.value.trim() || !fieldSlug.value.trim()) {
    editorError.textContent = 'Title and slug are required.';
    return;
  }

  const content = rawHtmlMode ? fieldContentHtml.value : fieldContent.innerHTML;

  const payload = {
    title: fieldTitle.value.trim(),
    slug: fieldSlug.value.trim(),
    excerpt: fieldExcerpt.value.trim(),
    featured_image_url: fieldImageUrl.value.trim(),
    content,
    tags: fieldTags.value.split(',').map(t => t.trim()).filter(Boolean),
    meta_title: fieldMetaTitle.value.trim(),
    meta_description: fieldMetaDescription.value.trim(),
    status: fieldStatus.value,
  };

  const id = fieldId.value;
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const res = await fetch(id ? `/blog/admin/api/posts/${id}` : '/blog/admin/api/posts', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { window.location.href = '/blog/admin/login'; return; }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.error || 'Save failed');
    }
    showList();
  } catch (e) {
    editorError.textContent = e.message || 'Could not save post.';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

/* ── WYSIWYG toolbar ── */

// Toolbar buttons must not steal focus/selection from the contenteditable on
// mousedown — that's the default browser behavior and it collapses whatever
// text was selected before execCommand ever runs, so formatting silently
// applies to a collapsed cursor instead of the selected text.
document.getElementById('wysiwyg-toolbar').addEventListener('mousedown', (e) => {
  if (e.target.closest('button[data-cmd]')) e.preventDefault();
});

document.getElementById('wysiwyg-toolbar').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-cmd]');
  if (!btn) return;
  const cmd = btn.dataset.cmd;
  if (cmd === 'createLink') {
    const url = window.prompt('Link URL:');
    if (url) document.execCommand(cmd, false, url);
  } else if (cmd === 'formatBlock') {
    document.execCommand(cmd, false, `<${btn.dataset.value}>`);
  } else {
    document.execCommand(cmd, false, null);
  }
});

document.getElementById('toggle-html-btn').addEventListener('click', () => {
  if (rawHtmlMode) {
    fieldContent.innerHTML = fieldContentHtml.value;
    fieldContent.style.display = '';
    fieldContentHtml.style.display = 'none';
  } else {
    fieldContentHtml.value = fieldContent.innerHTML;
    fieldContentHtml.style.display = '';
    fieldContent.style.display = 'none';
  }
  rawHtmlMode = !rawHtmlMode;
});

/* ── Image upload ── */

document.getElementById('upload-btn').addEventListener('click', () => {
  document.getElementById('upload-input').click();
});

document.getElementById('upload-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const uploadBtn = document.getElementById('upload-btn');
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading…';

  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/blog/admin/api/upload', { method: 'POST', body: formData });
    if (res.status === 401) { window.location.href = '/blog/admin/login'; return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    fieldImageUrl.value = data.url;
    imagePreview.src = data.url;
    imagePreview.style.display = '';
  } catch (err) {
    editorError.textContent = 'Image upload failed.';
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
    e.target.value = '';
  }
});

/* ── Slug auto-generation ── */

fieldTitle.addEventListener('input', () => {
  if (!slugManuallyEdited) fieldSlug.value = slugify(fieldTitle.value);
});
fieldSlug.addEventListener('input', () => { slugManuallyEdited = true; });

/* ── Wiring ── */

document.getElementById('new-post-btn').addEventListener('click', newPost);
document.getElementById('cancel-btn').addEventListener('click', showList);
document.getElementById('delete-btn').addEventListener('click', async () => {
  if (fieldId.value && (await deletePost(fieldId.value))) showList();
});
editorForm.addEventListener('submit', savePost);

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/blog/admin/api/logout', { method: 'POST' });
  window.location.href = '/blog/admin/login';
});

loadPosts();
