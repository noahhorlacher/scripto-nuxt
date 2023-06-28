<script setup>
  // editor
  import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import Typography from '@tiptap/extension-typography'
  import CharacterCount from '@tiptap/extension-character-count'
  import TextAlign from '@tiptap/extension-text-align'
  
  let saving = ref(false)
  
  // for autoSave
  let lastSave = {
    content: `
                  <h1>As ships sail seas</h1>
                  <p>Start adding content!</p>
              `,
    tags: []
  }
  
  let firstSave = false
  
  const showNewAttachmentModal = ref(false)
  
  const newAttachmentModel = ref({
    title: null,
    link: null,
    type: 1
  })

  const newAttachmentFormRef = ref(null)
  
  const showEditAttachmentModal = ref(false)

  const editAttachmentModel = ref({
    title: null,
    link: null,
    type: 1
  })
  const editAttachmentFormRef = ref(null)

  let attachmentId
  
  const linkTypes = ref([])

  // get link types
  //     const data = res.data.data
  //     linkTypes.value = data.map(t => {
  //       return {
  //         name: t.title,
  //         value: t.link_type_id
  //       }
  //     })
  
  const writingModel = ref({
    id: null,
    created: new Date(Date.now()),
    location: null,
    image: '',
    content: lastSave.content,
    favourite: false,
    draft: true,
    tags: [],
    links: [],
    editors: []
  })
  
  // autosaving
  let autoSaveInterval = setInterval(() => {
    if (firstSave && lastSave.content != editor.value?.getHTML())
      saveDocument()
  }, 5000)
  onUnmounted(() => clearInterval(autoSaveInterval))
  
  // tiptap editor
  const editor = useEditor({
    extensions: [
      BubbleMenu,
      FloatingMenu,
      Text,
      Paragraph,
      Document,
      Typography,
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote']
      }),
      StarterKit
    ],
    content: `
                  <h1>As ships sail seas</h1>
                  <h2>Waves will crash</h2>
                  <p>Start adding content!</p>
                  <blockquote>This is a quote.</blockquote>
                  <ol>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                  </ol>
                  <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                  </ul>
              `
  })
  
  // handle file uploaded
  const fileUploaded = ({ file, event }) => {
    if (event != null) {
      const fname = JSON.parse((event?.target).response).path.filename
      newAttachmentModel.value.link = `http://localhost:3000/public/uploads/${fname}`
      console.log('link', newAttachmentModel.value.link)
    }
  }
  
  // handle file removed
  function fileRemoved() {
    //   newAttachmentModel.value.link = null
  }
  
  // add a new attachment
  function addAttachment() {
    newAttachmentModel.value = {
      title: null,
      link: null,
      type: 1
    }
    showNewAttachmentModal.value = true
  }
  
  async function uploadAttachment(e) {
    e.preventDefault()
  
    saveDocument(() => {
      newAttachmentFormRef.value?.validate(async errors => {
        console.log('posting to writing id', writingModel.value.id)
        if (!errors) {
            // post document
            const params = {
              fk_writing: writingModel.value.id,
              title: newAttachmentModel.value.title,
              link: newAttachmentModel.value.link,
              fk_link_type: newAttachmentModel.value.type
            }
                // writingModel.value.links.push({
                //   title: newAttachmentModel.value.title,
                //   link: newAttachmentModel.value.link,
                //   link_type: {
                //     id: newAttachmentModel.value.type,
                //     title: linkTypes.value?.find(l => l.value == newAttachmentModel.value.type).label
                //   },
                //   writing_link_id: res.data.id
                // })
    
                showNewAttachmentModal.value = false
        } else {
          // error validating
        }
      })
    })
  
    showNewAttachmentModal.value = false
  }
  
  // edit the attachment
  function editAttachment(id) {
    const idx = writingModel.value.links.findIndex(l => l.writing_link_id == id)
    const link = writingModel.value.links[idx]
    attachmentId = idx
  
    console.log('link', link)
  
    editAttachmentModel.value = {
      title: link.title,
      link: link.link,
      type: link.link_type.id
    }
    showEditAttachmentModal.value = true
  }
  
  // update the edited attachment in backend
  function updateAttachment(e) {
    e.preventDefault()
  
    editAttachmentFormRef.value?.validate(async errors => {
      if (!errors) {
        // update
        const params = {
            writing_link_id: writingModel.value.links[attachmentId].writing_link_id,
            title: editAttachmentModel.value.title,
            link: editAttachmentModel.value.link,
            fk_link_type: editAttachmentModel.value.type
          }
          
        //   writingModel.value.links[attachmentId].title = editAttachmentModel.value.title
        //   writingModel.value.links[attachmentId].link = editAttachmentModel.value.link
        //   writingModel.value.links[attachmentId].link_type = {
        //     id: editAttachmentModel.value.type,
        //     title: linkTypes.value?.find(l => l.value == editAttachmentModel.value.type).label
        //   }
  
            showEditAttachmentModal.value = false
            attachmentId = null
      } else {
        // error validating
      }
    })
  
    showNewAttachmentModal.value = false
  }
  
  // remove attachment from writing
  function removeAttachment(id) {
  }
  
  // get icon for attachment
  function getAttachmentIcon(link_type) {
  const iconMapping = {
    'Music': 'i-heroicons-musical-note',
    'Image': 'i-heroicons-photo',
    'Wiki': 'i-heroicons-light-bulb',
    'Tips': 'i-heroicons-chat-bubble-bottom-center-text',
    'Inspiration': 'i-heroicons-heart',
  }

  return iconMapping[link_type] || 'i-heroicons-rectangle-stack'
}
  
  // save the document to the db
  function saveDocument(cb = () => { }) {
    saving.value = true
    writingModel.value.content = editor.value?.getHTML() || ''
    lastSave.content = writingModel.value.content
  
    // save to db
    if (firstSave == false || !writingModel.value.id) {
      const params = {
        created: writingModel.value.created,
        image: writingModel.value.image,
        content: writingModel.value.content,
        favourite: writingModel.value.favourite,
        draft: writingModel.value.draft,
        tags: writingModel.value.tags,
        links: writingModel.value.links,
        editors: writingModel.value.editors,
        location: writingModel.value.location
      }
    
    //     // update writingModel with id
    //     firstSave = true
    //     writingModel.value.id = res.data.id
    //     saving.value = false
    //     cb()
    //   }, res => {
    //     console.error('Backend validation error', res.response.data)
    //     message.error('An error occured while saving your document')
    //     saving.value = false
    //     cb()
    //   })
    } else if (writingModel.value.id) {
      // update in db
      const params = {
        created: writingModel.value.created,
        image: writingModel.value.image,
        content: writingModel.value.content,
        favourite: writingModel.value.favourite,
        draft: writingModel.value.draft,
        tags: writingModel.value.tags,
        links: writingModel.value.links,
        editors: writingModel.value.editors,
        location: writingModel.value.location
      }
        cb()
    }
  }
  
  // toggle favourite and save
  function toggleFavourite() {
    writingModel.value.favourite = !writingModel.value.favourite
    saveDocument()
  }
  
  // toggle draft and save
  function toggleDraft() {
    writingModel.value.draft = !writingModel.value.draft
    saveDocument()
  }
  </script>

<template>
    <div>
      <div v-if="editor">
        <bubble-menu class="bubble-menu" :tippy-options="{ duration: 100 }" :editor="editor">
          <div class="icon">
            <u-icon
              name="i-tabler-bold"
              @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" />
          </div>
          <div class="icon">
            <u-icon
            name="i-tabler-italic"
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }" />
          </div>
          <div class="icon">
            <u-icon
              name="i-tabler-strikethrough"
              @click="editor.chain().focus().toggleStrike().run()"
              :class="{ 'is-active': editor.isActive('strike') }"/>
          </div>
          <div class="icon">
          <u-icon
            name="i-tabler-align-left"
            @click="editor.chain().focus().setTextAlign('left').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }" />
          </div>
          <div class="icon">
            <u-icon
              name="i-tabler-align-center"
              @click="editor.chain().focus().setTextAlign('center').run()"
              :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }" />
          </div>
          <div class="icon">
          <u-icon
            name="i-tabler-align-right"
            @click="editor.chain().focus().setTextAlign('right').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }" />
          </div>
          <div class="icon">
          <u-icon
            name="i-tabler-align-justified"
            @click="editor.chain().focus().setTextAlign('justify').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }" />
          </div>
        </bubble-menu>
        <floating-menu class="floating-menu" :tippy-options="{ duration: 100 }" :editor="editor">
          <div class="icon">
            <u-icon
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
              name="i-tabler-h-1" />
          </div>
          <div class="icon">
            <u-icon
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
              name="i-tabler-h-2" />
          </div>
          <div class="icon">
            <u-icon
              @click="editor.chain().focus().toggleBulletList().run()"
              :class="{ 'is-active': editor.isActive('bulletList') }"
              name="i-tabler-list" />
          </div>
          <div class="icon">
            <u-icon
              @click="editor.chain().focus().toggleOrderedList().run()"
              :class="{ 'is-active': editor.isActive('orderedList') }"
              name="i-tabler-list-numbers" />
          </div>
          <div class="icon">
            <u-icon
              @click="editor.chain().focus().toggleBlockquote().run()"
              :class="{ 'is-active': editor.isActive('quote') }"
              name="i-tabler-quote" />
          </div>
        </floating-menu>
      </div>
      <p class="character-count" v-if="editor">
        {{ editor.storage.characterCount.characters() }} characters, {{ editor.storage.characterCount.words() }}
        words
      </p>
      <editor-content class="main-editor" :editor="editor" />
    </div>
    <div class="flex justify-between mt-6">
      <div>
        <u-tooltip text="Favorite">
            <u-button
                @click="toggleFavourite"
                :variant="writingModel.favourite ? 'solid' : 'outline'"
                color="amber"
                size="lg"
                :icon="writingModel.favourite ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                />
        </u-tooltip>
        <u-tooltip text="Draft">
            <u-button
                @click="toggleDraft"
                :type="writingModel.draft ? 'solid' : 'outline'"
                color="orange"
                size="lg"
                :icon="writingModel.draft ? 'i-heroicons-clock-solid' : 'i-heroicons-clock'"
                />
        </u-tooltip>
      </div>
      <div>
        <u-button v-if="!saving" icon="i-heroicons-arrow-down-on-square" :loading="saving" @click="() => saveDocument()" type="primary">
            Save
        </u-button>
      </div>
    </div>
  
    <div class="flex gap-x-2">
      <u-icon name="i-heroicons-calendar" />
      <h3>Created</h3>
    </div>
    <div class="datetime-container">
      <u-date-picker v-model="writingModel.created" />
    </div>
  
    <u-form-group label="Location">
      <u-input icon="i-heroicons-map" placeholder="Where was this written?" maxlength="80" v-model="writingModel.location" />
    </u-form-group>
  
    <u-form-group label="Editors">
      <u-input icon="i-heroicons-users" placeholder="Noah Horlacher" />
      <!-- <u-select v-model="writingModel.editors" multiple @update:value="() => saveDocument()" /> -->
    </u-form-group>

    <u-form-group label="Tags">
      <u-input icon="i-heroicons-tag" placeholder="Tags" />
      <!-- <u-select v-model="writingModel.tags" multiple @update:value="() => saveDocument()" /> -->
    </u-form-group>
  
    <div class="flex">
      <u-icon name="i-tabler-link" size="24" />
      <h3>Attachments</h3>
    </div>

    <div class="flex justify-center">
      <div v-for="(link, index) in writingModel.links" :key="index">
        <u-card class="writing">
          <div class="flex justify-start">

            <div class="flex justify-start">
              <u-icon :name="getAttachmentIcon(link.link_type.title)" />
              <NuxtLink to="link.link">{{ link.title }}</NuxtLink>
            </div>

            <u-tooltip text="Remove">
                <u-button icon="i-tabler-link-off" @click="() => removeAttachment(link.writing_link_id)" class="unlink" />
            </u-tooltip>

            <u-tooltip text="Edit">
                <u-button icon="i-tabler-edit" @click="() => editAttachment(link.writing_link_id)" />
            </u-tooltip>
            
          </div>
        </u-card>
      </div>
      <u-tooltip text="Add Attachment">
          <u-button icon="i-heroicons-document-plus" @click="addAttachment" />
      </u-tooltip>
    </div>
  
    <u-modal v-model="showEditAttachmentModal">
      <u-card style="width: 600px">
        <template #header>Edit Attachment</template>
          <div ref="rCategory" path="type" label="Category" required>
            <u-select placeholder="—" v-model="editAttachmentModel.type" :options="linkTypes" option-attribute="name" />
          </div>
          <div path="title" label="Title" required>
            <u-input v-model="editAttachmentModel.title" maxlength="30" @keydown.enter.prevent
              placeholder="New Attachment" />
          </div>
          <div v-if="editAttachmentModel.type == 2">
            <div label="Image">
              <!-- <u-upload accept=".jpeg,.jpg,.png,.gif,.webp" :max="1" name="image"
                action="http://localhost:3000/api/v1/image/" @finish="fileUploaded" @remove="fileRemoved">
                <u-button>Upload Image</u-button>
              </u-upload> -->
            </div>
          </div>
          <div v-else>
            <div path="link" label="Link" required>
              <u-input v-model="editAttachmentModel.link" maxlength="256" @keydown.enter.prevent
                placeholder="https://url.com/interesting" />
            </div>
          </div>
  
        <template #footer>
          <div class="flex justify-between">
            <u-button @click="showEditAttachmentModal = false">Cancel</u-button>
            <u-button icon="i-heroicons-arrow-down-on-square" @click="e => updateAttachment(e)">Save</u-button>
          </div>
        </template>
      </u-card>
    </u-modal>
  
    <u-modal v-model="showNewAttachmentModal">
      <u-card>
        <template #header>Add Attachment</template>
  
          <div ref="rCategory" path="type" label="Category" required>
            <u-select placeholder="—" v-model="newAttachmentModel.type" :options="linkTypes"
              option-attribute="name" />
          </div>
          <div path="title" label="Title" required>
            <u-input v-model="newAttachmentModel.title" maxlength="30" @keydown.enter.prevent
              placeholder="New Attachment" />
          </div>
          <div v-if="newAttachmentModel.type == 2">
            <div label="Image">
              <!-- <u-upload accept=".jpeg,.jpg,.png,.gif,.webp" :max="1" name="image"
                action="http://localhost:3000/api/v1/image/" @finish="fileUploaded" @remove="fileRemoved">
                <u-button>Upload Image</u-button>
              </u-upload> -->
            </div>
          </div>
          <div v-else>
            <div path="link" label="Link" required>
              <u-input v-model="newAttachmentModel.link" maxlength="256" @keydown.enter.prevent
                placeholder="https://url.com/interesting" />
            </div>
          </div>
  
        <template #footer>
          <div class="flex justify-between">
            <u-button @click="showNewAttachmentModal = false">Cancel</u-button>
            <u-button icon="i-heroicons-plus" @click="uploadAttachment">Add</u-button>
          </div>
        </template>
      </u-card>
    </u-modal>
  </template>

<style>
  .unlink {
    margin-left: 16px;
  }
  
  .date {
    margin-top: 8px;
  }
  
  .tags {
    margin-top: 16px;
  }
  
  .dateContainer {
    margin-top: 48px;
  }
  
  h3 {
    margin: 0;
  }
  
  .tags-header {
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  .datetime-container {
    margin-top: -24px;
  }
  
  .section-header {
    margin: 48px 0 16px 0;
  }
  
  .character-count {
    opacity: .7;
    margin: 1em 0;
    text-align: right;
  }
  
  .title-editor .ProseMirror {
    padding: .6em 2em;
    border: 0;
  }
  
  .main-editor .ProseMirror {
    border-radius: 3px;
    border: 2px solid rgba(255, 255, 255, .1);
    padding: 1em 2em;
    letter-spacing: 0.025rem;
    font-weight: 300;
  }
  
  .ProseMirror>*+* {
    margin-top: .75em;
  }
  
  .ProseMirror .is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: #ced4da;
    pointer-events: none;
    height: 0;
  }
  
  .ProseMirror h1,
  .ProseMirror h2 {
    line-height: 1.1;
  }

  .ProseMirror h1 {
    font-size: 1.7rem;
    font-weight: 800;
  }

  .ProseMirror h2 {
    font-size: 1.3rem;
    font-weight: 500;
  }
  
  .ProseMirror ul,
  .ProseMirror ol {
    padding: 0 1rem;
  }
  .ProseMirror ul {
    list-style: disc;
  }

  .ProseMirror ol {
    list-style: decimal;
  }
  
  .ProseMirror blockquote {
    padding-left: 1rem;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
  }
  
  .bubble-menu,
  .floating-menu {
    cursor: pointer;
    background-color: rgb(72, 72, 78);
    
    font-size: 1.3rem;
    display: flex;
    padding: 0.3rem 0.3rem 0 0.3rem;
    border-radius: 0.5rem;
  }
  
  .bubble-menu .icon,
  .floating-menu .icon {
    color: #FFF;
    opacity: 0.6;
    margin: 0;
  }
  
  .bubble-menu .icon:is(:hover, .is-active),
  .floating-menu .icon:is(:hover, .is-active) {
    opacity: 1;
  }
  </style>