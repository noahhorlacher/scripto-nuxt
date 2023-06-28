<script setup>
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const editorObject = useEditor({
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
    content: props.modelValue,
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== editorObject.value.getHTML()) {
      editorObject.commands.setContent(newValue)
    }
  }
)
</script>


<template>
<div>
  <div v-if="editorObject">
    <bubble-menu class="bubble-menu" :tippy-options="{ duration: 100 }" :editor="editorObject">
      <div class="icon">
        <u-icon
          name="i-tabler-bold"
          @click="editorObject.chain().focus().toggleBold().run()" :class="{ 'is-active': editorObject.isActive('bold') }" />
      </div>
      <div class="icon">
        <u-icon
        name="i-tabler-italic"
        @click="editorObject.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editorObject.isActive('italic') }" />
      </div>
      <div class="icon">
        <u-icon
          name="i-tabler-strikethrough"
          @click="editorObject.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editorObject.isActive('strike') }"/>
      </div>
      <div class="icon">
      <u-icon
        name="i-tabler-align-left"
        @click="editorObject.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editorObject.isActive({ textAlign: 'left' }) }" />
      </div>
      <div class="icon">
        <u-icon
          name="i-tabler-align-center"
          @click="editorObject.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editorObject.isActive({ textAlign: 'center' }) }" />
      </div>
      <div class="icon">
      <u-icon
        name="i-tabler-align-right"
        @click="editorObject.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editorObject.isActive({ textAlign: 'right' }) }" />
      </div>
      <div class="icon">
      <u-icon
        name="i-tabler-align-justified"
        @click="editorObject.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editorObject.isActive({ textAlign: 'justify' }) }" />
      </div>
    </bubble-menu>
    <floating-menu class="floating-menu" :tippy-options="{ duration: 100 }" :editor="editorObject">
      <div class="icon">
        <u-icon
          @click="editorObject.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editorObject.isActive('heading', { level: 1 }) }"
          name="i-tabler-h-1" />
      </div>
      <div class="icon">
        <u-icon
          @click="editorObject.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editorObject.isActive('heading', { level: 2 }) }"
          name="i-tabler-h-2" />
      </div>
      <div class="icon">
        <u-icon
          @click="editorObject.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editorObject.isActive('bulletList') }"
          name="i-tabler-list" />
      </div>
      <div class="icon">
        <u-icon
          @click="editorObject.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editorObject.isActive('orderedList') }"
          name="i-tabler-list-numbers" />
      </div>
      <div class="icon">
        <u-icon
          @click="editorObject.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editorObject.isActive('quote') }"
          name="i-tabler-quote" />
      </div>
    </floating-menu>
  </div>
  <p class="character-count" v-if="editorObject">
    {{ editorObject.storage.characterCount.characters() }} characters, {{ editorObject.storage.characterCount.words() }}
    words
  </p>
  <editor-content class="main-editor" :editor="editorObject" />
</div>
</template>

<style>
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