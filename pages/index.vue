  
  <script setup lang="ts">
  import { NDatePicker, type FormInst, type FormRules, type UploadFileInfo, NSelect, NInput, NUpload, NModal, NForm, NFormItem, NCard, NTooltip, NSpin, NSpace, NButton, NIcon, NDynamicTags, useMessage } from 'naive-ui'
  import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { Location as LocationIcon, Person as PersonIcon, Calendar as CalendarIcon, Edit as EditIcon, Unlink as UnlinkIcon, Attachment as AttachmentIcon, Tag as TagIcon, Image as ImageIcon, Bookmark as TipIcon, Idea as InspirationIcon, Music as MusicIcon, Add as AddIcon, Save as SaveIcon, Star as StarIcon, StarFilled as StarIconFilled, TextBold as BoldIcon, TextItalic as ItalicIcon, TextStrikethrough as StrikethroughIcon } from '@vicons/carbon'
  import { AlignLeft as LeftIcon, AlignCenter as CenterIcon, AlignRight as RightIcon, AlignJustified as JustifiedIcon, H1 as H1Icon, H2 as H2Icon, List as ListIcon, Blockquote as QuoteIcon, Book2 as WikiIcon, Stack2 as OtherIcon } from "@vicons/tabler"
  import { Timer12Regular as DraftIcon, Timer12Filled as DraftIconFilled } from '@vicons/fluent'
  import { ArrowBack as BackIcon } from '@vicons/tabler'
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import Typography from '@tiptap/extension-typography'
  import CharacterCount from '@tiptap/extension-character-count'
  import TextAlign from '@tiptap/extension-text-align'
  import { onUnmounted } from 'vue'
  import axios from 'axios'
  
  const message = useMessage()
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
  // type for the form model
  interface AttachmentModelType {
    title: string | null,
    link: string | null,
    type: number | null
  }
  const newAttachmentModel = ref<AttachmentModelType>({
    title: null,
    link: null,
    type: 1
  })
  const newAttachmentFormRef = ref<FormInst | null>(null)
  const newAttachmentFormRules: FormRules = {
    category: [
      { required: true, message: 'Select a category' }
    ],
    title: [
      { required: true, message: 'Give your attachment a title' },
      { min: 1, message: 'Give your attachment a title' }
    ],
    link: [
      { required: true, message: 'Enter a link' },
      { min: 1, message: 'Enter a link' }
    ]
  }
  
  const showEditAttachmentModal = ref(false)
  // type for the form model
  const editAttachmentModel = ref<AttachmentModelType>({
    title: null,
    link: null,
    type: 1
  })
  const editAttachmentFormRef = ref<FormInst | null>(null)
  const editAttachmentFormRules: FormRules = {
    category: [
      { required: true, message: 'Select a category' }
    ],
    title: [
      { required: true, message: 'Give your attachment a title' },
      { min: 1, message: 'Give your attachment a title' }
    ],
    link: [
      { required: true, message: 'Enter a link' },
      { min: 1, message: 'Enter a link' }
    ]
  }
  let attachmentId
  
  const linkTypes = ref([])
  axios.get('http://localhost:3000/api/v1/link').then(res => {
    const data = res.data.data
    linkTypes.value = data.map(t => {
      return {
        label: t.title,
        value: t.link_type_id
      }
    })
  })
  
  const writingModel = ref({
    id: null,
    created: Date.now(),
    location: null,
    image: '',
    content: lastSave.content,
    favourite: false,
    draft: true,
    tags: [],
    links: [],
    editors: []
  })
  
  let autoSaveInterval = setInterval(() => {
    if (firstSave && lastSave.content != editor.value?.getHTML())
      saveDocument()
  }, 5000)
  onUnmounted(() => clearInterval(autoSaveInterval))
  
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
                  <p>Start adding content!</p>
              `
  })
  
  // handle file uploaded
  const fileUploaded: OnFinish = ({ file, event }: { file: UploadFileInfo, event?: ProgressEvent }) => {
    if (event != null) {
      const fname = JSON.parse((event?.target as XMLHttpRequest).response).path.filename
      newAttachmentModel.value.link = `http://localhost:3000/public/uploads/${fname}`
      console.log('link', newAttachmentModel.value.link)
    }
  }
  
  // handle file removed
  function fileRemoved() {
    axios.delete(`http://localhost:3000/api/v1/image/${newAttachmentModel.value.link.split('/').pop()}`).then(res => {
      newAttachmentModel.value.link = null
    })
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
  
  async function uploadAttachment(e: MouseEvent) {
    e.preventDefault()
  
    saveDocument(() => {
      newAttachmentFormRef.value?.validate(async errors => {
        console.log('posting to writing id', writingModel.value.id)
        if (!errors) {
          axios.post('http://localhost:3000/api/v1/link/writing', {
            params: {
              fk_writing: writingModel.value.id,
              title: newAttachmentModel.value.title,
              link: newAttachmentModel.value.link,
              fk_link_type: newAttachmentModel.value.type
            }
          }).then(res => {
            writingModel.value.links.push({
              title: newAttachmentModel.value.title,
              link: newAttachmentModel.value.link,
              link_type: {
                id: newAttachmentModel.value.type,
                title: linkTypes.value?.find(l => l.value == newAttachmentModel.value.type).label
              },
              writing_link_id: res.data.id
            })
  
            console.log('new attachment', {
              title: newAttachmentModel.value.title,
              link: newAttachmentModel.value.link,
              link_type: {
                id: newAttachmentModel.value.type,
                title: linkTypes.value?.find(l => l.value == newAttachmentModel.value.type).label
              },
              writing_link_id: res.data.id
            })
  
            showNewAttachmentModal.value = false
          }, res => {
            console.error('Backend validation error', res.response.data)
            message.error('Ein Fehler ist aufgetreten')
          })
        } else {
          message.error('Ihre Eingabe enthält Fehler')
        }
      })
    })
  
    showNewAttachmentModal.value = false
  }
  
  // edit the attachment
  function editAttachment(id: number) {
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
  
  // put the edited attachment
  function updateAttachment(e: MouseEvent) {
    e.preventDefault()
  
    editAttachmentFormRef.value?.validate(async errors => {
      if (!errors) {
        axios.put('http://localhost:3000/api/v1/link/writing', {
          params: {
            writing_link_id: writingModel.value.links[attachmentId].writing_link_id,
            title: editAttachmentModel.value.title,
            link: editAttachmentModel.value.link,
            fk_link_type: editAttachmentModel.value.type
          }
        }).then(res => {
          writingModel.value.links[attachmentId].title = editAttachmentModel.value.title
          writingModel.value.links[attachmentId].link = editAttachmentModel.value.link
          writingModel.value.links[attachmentId].link_type = {
            id: editAttachmentModel.value.type,
            title: linkTypes.value?.find(l => l.value == editAttachmentModel.value.type).label
          }
  
          showEditAttachmentModal.value = false
          attachmentId = null
        }, res => {
          console.error('Backend validation error', res.response.data)
          message.error('Ein Fehler ist aufgetreten')
        })
      } else {
        message.error('Ihre Eingabe enthält Fehler')
      }
    })
  
    showNewAttachmentModal.value = false
  }
  
  // remove attachment from writing
  function removeAttachment(id: number) {
    axios.delete(`http://localhost:3000/api/v1/link/writing/${id}`).then(() => {
      let idx = writingModel.value.links.findIndex(l => l.writing_link_id == id)
      writingModel.value.links.splice(idx)
    }, () => {
      message.error(`Couldn't remove attachment.`)
    })
  }
  
  // get icon for attachment
  function getAttachmentIcon(link_type: string) {
    if (link_type == 'Music') return MusicIcon
    else if (link_type == 'Image') return ImageIcon
    else if (link_type == 'Wiki') return WikiIcon
    else if (link_type == 'Tips') return TipIcon
    else if (link_type == 'Inspiration') return InspirationIcon
    else return OtherIcon
  }
  
  // save the document to the db
  function saveDocument(cb = () => { }) {
    saving.value = true
    writingModel.value.content = editor.value?.getHTML() || ''
    lastSave.content = writingModel.value.content
  
    // save to db
    if (firstSave == false || !writingModel.value.id) {
      // save to db
      axios.post('http://localhost:3000/api/v1/writing', {
        params: {
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
      }).then(res => {
        // update writingModel with id
        firstSave = true
        writingModel.value.id = res.data.id
        console.log('saved id', writingModel.value.id)
        saving.value = false
        cb()
      }, res => {
        console.error('Backend validation error', res.response.data)
        message.error('An error occured while saving your document')
        saving.value = false
        cb()
      })
    } else if (writingModel.value.id) {
      // update in db
      axios.put(`http://localhost:3000/api/v1/writing/${writingModel.value.id}`, {
        params: {
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
      }).then(res => {
        // message.success('Your document has been saved')
        saving.value = false
        cb()
      }, res => {
        console.error('Backend validation error', res.response.data)
        message.error('An error occured while saving your document')
        saving.value = false
        cb()
      })
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
    <router-link to="/writings">
      <n-tooltip>
        <template #trigger>
          <n-button class="backlink" strong secondary type="tertiary">
            <template #icon>
              <n-icon :component="BackIcon" />
            </template>
          </n-button>
        </template>
        Go Back
      </n-tooltip>
    </router-link>
  
    <div>
      <div v-if="editor">
        <bubble-menu class="bubble-menu" :tippy-options="{ duration: 100 }" :editor="editor">
          <n-icon @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
            <bold-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }">
            <italic-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }">
            <strikethrough-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().setTextAlign('left').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">
            <left-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().setTextAlign('center').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">
            <center-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().setTextAlign('right').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">
            <right-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().setTextAlign('justify').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }">
            <justified-icon />
          </n-icon>
        </bubble-menu>
        <floating-menu class="floating-menu" :tippy-options="{ duration: 100 }" :editor="editor">
          <n-icon @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
            <h1-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
            <h2-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }">
            <list-icon />
          </n-icon>
          <n-icon @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': editor.isActive('quote') }">
            <quote-icon />
          </n-icon>
        </floating-menu>
      </div>
      <p class="character-count" v-if="editor">
        {{ editor.storage.characterCount.characters() }} characters, {{ editor.storage.characterCount.words() }}
        words
      </p>
      <editor-content class="main-editor" :editor="editor" />
    </div>
    <n-space class="action-buttons" justify="space-between" align="center">
      <n-space>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button @click="toggleFavourite" :type="writingModel.favourite ? 'info' : 'default'" secondary>
              <template #icon>
                <n-icon :component="writingModel.favourite ? StarIconFilled : StarIcon" />
              </template>
            </n-button>
          </template>
          Favorite
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button @click="toggleDraft" :type="writingModel.draft ? 'warning' : 'default'" secondary>
              <template #icon>
                <n-icon :component="writingModel.draft ? DraftIconFilled : DraftIcon" />
              </template>
            </n-button>
          </template>
          Draft
        </n-tooltip>
      </n-space>
      <n-space justify="end">
        <n-spin size="small" v-if="saving" />
        <n-button v-if="!saving" @click="() => saveDocument()" type="primary">
          <template #icon>
            <n-icon :component="SaveIcon" />
          </template>
          Save
        </n-button>
      </n-space>
    </n-space>
  
    <n-space class="section-header" align=" center">
      <n-icon :component="CalendarIcon" size="24" />
      <h3>Created</h3>
    </n-space>
    <n-form-item class="datetime-container">
      <n-date-picker type="datetime" v-model:value="writingModel.created"></n-date-picker>
    </n-form-item>
  
    <n-space class="tags-header" align="center">
      <n-icon :component="LocationIcon" size="24" />
      <h3>Location</h3>
    </n-space>
    <n-form-item class="datetime-container">
      <n-input type="text" placeholder="Where was this written?" maxlength="80" v-model:value="writingModel.location" />
    </n-form-item>
  
    <n-space class="tags-header" align="center">
      <n-icon :component="PersonIcon" size="24" />
      <h3>Editors</h3>
    </n-space>
    <n-dynamic-tags v-model:value="writingModel.editors" @update:value="() => saveDocument()" />
  
    <n-space class="tags-header" align="center">
      <n-icon :component="TagIcon" size="24" />
      <h3>Tags</h3>
    </n-space>
    <n-dynamic-tags v-model:value="writingModel.tags" @update:value="() => saveDocument()" />
  
    <n-space align="center" class="section-header">
      <n-icon :component="AttachmentIcon" size="24" />
      <h3>Attachments</h3>
    </n-space>
    <n-space align="center">
      <div v-for="link in writingModel.links">
        <n-card class="writing" hoverable>
          <n-space align="center">
            <n-space align="center">
              <n-icon :component="getAttachmentIcon(link.link_type.title)" />
              <a :href="link.link" target="_blank">{{ link.title }}</a>
            </n-space>
            <n-tooltip>
              <template #trigger>
                <n-button @click="() => removeAttachment(link.writing_link_id)" strong secondary type="tertiary"
                  class="unlink">
                  <template #icon>
                    <n-icon :component="UnlinkIcon" />
                  </template>
                </n-button>
              </template>
              Remove
            </n-tooltip>
            <n-tooltip>
              <template #trigger>
                <n-button @click="() => editAttachment(link.writing_link_id)" strong secondary type="tertiary">
                  <template #icon>
                    <n-icon :component="EditIcon" />
                  </template>
                </n-button>
              </template>
              Edit
            </n-tooltip>
          </n-space>
        </n-card>
      </div>
      <n-tooltip>
        <template #trigger>
          <n-button @click="addAttachment" strong secondary type="tertiary">
            <template #icon>
              <n-icon :component="AddIcon" />
            </template>
          </n-button>
        </template>
        Add Attachment
      </n-tooltip>
    </n-space>
  
    <n-modal v-model:show="showEditAttachmentModal">
      <n-card style="width: 600px" title="Edit Attachment" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <template #header>Edit Attachment</template>
  
        <n-form ref="editAttachmentFormRef" :model="editAttachmentModel" :rules="editAttachmentFormRules">
          <n-form-item ref="rCategory" path="type" label="Category" required>
            <n-select placeholder="—" v-model:value="editAttachmentModel.type" :options="linkTypes"
              :consistent-menu-width="false" required />
          </n-form-item>
          <n-form-item path="title" label="Title" required>
            <n-input v-model:value="editAttachmentModel.title" maxlength="30" type="text" @keydown.enter.prevent
              placeholder="New Attachment" />
          </n-form-item>
          <div v-if="editAttachmentModel.type == 2">
            <n-form-item label="Image">
              <n-upload accept=".jpeg,.jpg,.png,.gif,.webp" :max="1" name="image"
                action="http://localhost:3000/api/v1/image/" @finish="fileUploaded" @remove="fileRemoved">
                <n-button>Upload Image</n-button>
              </n-upload>
            </n-form-item>
          </div>
          <div v-else>
            <n-form-item path="link" label="Link" required>
              <n-input v-model:value="editAttachmentModel.link" maxlength="256" type="text" @keydown.enter.prevent
                placeholder="https://url.com/interesting" />
            </n-form-item>
          </div>
        </n-form>
  
        <template #footer>
          <n-space justify="space-between">
            <n-button @click="showEditAttachmentModal = false">Cancel</n-button>
            <n-button type="success" @click="e => updateAttachment(e)">Save</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  
    <n-modal v-model:show="showNewAttachmentModal">
      <n-card style="width: 600px" title="Add Attachment" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <template #header>Add Attachment</template>
  
        <n-form ref="newAttachmentFormRef" :model="newAttachmentModel" :rules="newAttachmentFormRules">
          <n-form-item ref="rCategory" path="type" label="Category" required>
            <n-select placeholder="—" v-model:value="newAttachmentModel.type" :options="linkTypes"
              :consistent-menu-width="false" required />
          </n-form-item>
          <n-form-item path="title" label="Title" required>
            <n-input v-model:value="newAttachmentModel.title" maxlength="30" type="text" @keydown.enter.prevent
              placeholder="New Attachment" />
          </n-form-item>
          <div v-if="newAttachmentModel.type == 2">
            <n-form-item label="Image">
              <n-upload accept=".jpeg,.jpg,.png,.gif,.webp" :max="1" name="image"
                action="http://localhost:3000/api/v1/image/" @finish="fileUploaded" @remove="fileRemoved">
                <n-button>Upload Image</n-button>
              </n-upload>
            </n-form-item>
          </div>
          <div v-else>
            <n-form-item path="link" label="Link" required>
              <n-input v-model:value="newAttachmentModel.link" maxlength="256" type="text" @keydown.enter.prevent
                placeholder="https://url.com/interesting" />
            </n-form-item>
          </div>
        </n-form>
  
        <template #footer>
          <n-space justify="space-between">
            <n-button @click="showNewAttachmentModal = false">Cancel</n-button>
            <n-button type="success" @click="uploadAttachment">Add</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
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
  
  .bubble-menu,
  .floating-menu {
    cursor: pointer;
    background-color: rgb(72, 72, 78);
  }
  
  .action-buttons {
    margin-top: 1em;
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
  
  .ProseMirror ul,
  .ProseMirror ol {
    padding: 0 1rem;
  }
  
  .ProseMirror blockquote {
    padding-left: 1rem;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
  }
  
  .bubble-menu {
    display: flex;
    padding: 0.2rem;
    border-radius: 0.5rem;
  }
  
  .bubble-menu .n-icon {
    border: none;
    background: none;
    color: #FFF;
    font-size: 1.5rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;
  }
  
  .bubble-menu .n-icon:hover,
  .bubble-menu .n-icon.is-active {
    opacity: 1;
  }
  
  .floating-menu {
    display: flex;
    padding: 0.2rem;
    border-radius: 0.5rem;
  }
  
  .floating-menu .n-icon {
    border: none;
    background: none;
    font-size: 1.5rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;
  }
  
  .floating-menu .n-icon:hover,
  .floating-menu .n-icon.is-active {
    opacity: 1;
  }
  </style>