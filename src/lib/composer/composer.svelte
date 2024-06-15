<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { eye, send, close } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import {getPresignedURL, uploadAttachment, savePost,
    getLinkMetadata } from '$lib/utils/request.js'
import {UploadWithProgress } from '$lib/utils/request.js'
import { replaceEmoji, trimBody, resizeImage } from '$lib/utils/utils.js'
import { md } from './md/md.js'
import autosize from '$lib/vendor/autosize/autosize'
import { store } from '$lib/store/store.js'
import Attach from './attachments/attach.svelte'
import InsertEmoji from './insert-emoji.svelte'
import InsertGIF from '$lib/gif/gif.svelte'
import Attachments from './attachments/attachments.svelte'
import Links from './links/links.svelte'
import EmojiList from './emoji-list.svelte'
import Event from '$lib/board/event/event.svelte'
import tippy from 'tippy.js';


export let roomID = null;
export let room_alias = null;
export let placeholder = `What's on your mind?`;
export let replyTo = false;
export let threadEvent = null;
export let reply = false;
export let topic = null;

export let editing = false;
export let editingEvent = null;
export let editingReply = false;

export let isChat = false;

export let thread_view = false;
export let thread_view_event = null;

export let reference = null;

$: isthreadView = thread_view && thread_view_event

$: stateKey = isthreadView ? thread_view_event : !reply ? roomID : roomID + threadEvent

$: state = $store.editorStates[stateKey]


$: gif_enabled = $store.features?.gif?.enabled &&
    $store.features?.gif?.service == 'tenor' && 
    (isChat || reply)

const dispatch = createEventDispatcher()

function kill() {
    if(busy) {
        return
    }
    dispatch('kill')
    if(!isChat) {
        reset()
    }
}

function killReference() {
    if(busy) {
        return
    }
    dispatch('kill-reference')
    focusBodyInput()
}


$: space_emoji = $store.space_emoji?.filter(x => x.alias ==
    room_alias)[0]?.emoji

$: isSocial = $page?.params?.space?.startsWith('@')

let editor;
let ready = false;


async function loadFullBody() {
    let fullBodyURL = `${PUBLIC_MEDIA_URL}/${editingEvent?.content?.full_body?.key}`
    console.log("getting full body")
    fetch(fullBodyURL)
        .then(response => response.text())
        .then(data => {
            bodyInput.value = data
            console.log(data)
        })
        .catch((error) => {
            fetch_error = error
        });
}

onMount(() => {

    if(editing && editingEvent) {

        bodyInput.value = editingEvent?.content?.body
        if(editingEvent?.content?.full_body) {
            loadFullBody()
        }

        if(editingEvent?.content?.title) {
            titleInput.value = editingEvent?.content?.title
        }
        autosize(titleInput)
        autosize(bodyInput)
        focusBodyInput()
    }

    if(state && !editing) {
        if(state?.title) {
            titleInput.value = state?.title
        }
        if(state?.body) {
            bodyInput.value = state?.body
        }
        autosize(titleInput)
        autosize(bodyInput)
        if(state.focus == 'body') {
            bodyInput.selectionStart = state.cursor;
            bodyInput.selectionEnd = state.cursor;
            //focusBodyInput()
            if(state.scroll) {
                bodyInput.scrollTop = state.scroll
            }
        }
        if(state.focus == 'title') {
            titleInput.selectionStart = state.cursor;
            titleInput.selectionEnd = state.cursor;
            focusTitleInput()
        }
            focusTitleInput()
    }

    if(!state && !editing) {
        store.addEditorState({
            room_id: stateKey,
            state: {
                title: '',
                body: '',
                focus: null,
                cursor: 0,
                scroll: 0,
            }

        })

        if(!reply) {
            autosize(titleInput)
        }
        autosize(bodyInput)

        if(!reply) {
            focusTitleInput()
        }
        if(reply) {
            focusBodyInput()
        }

    }


    bodyInput.addEventListener('scroll', handleScroll);

    tippy(preview, {
        content: "Preview Markdown",
        placement: 'top',
        arrow: false,
        duration: 1,
    });
    tippy('.send', {
        content: 'Send Message',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });


    if(replyTo) {
        lastReplyTo = replyTo
    }


    setupLinkPasteListener()

    $store.loadEmojiPicker = true

    if(isChat) {
        focusBodyInput()
    }

})

function setupLinkPasteListener() {
    bodyInput.addEventListener('paste', (e) => {
        //let expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
        const expression = /(https?:\/\/[^\s]+)/g;
        let regex = new RegExp(expression);
 
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        let matches = paste.match(regex);
        if(matches && matches.length > 0) {
            for(let i=0;i<matches.length; i++) {
                if(i == 9) {
                    break
                }
                console.log(matches[i])

                processLink(matches[i]);
            }
        }
    }); 

}



async function processLink(href) {
    const res = await getLinkMetadata(href)
    console.log(res)
    if(res?.metadata?.title) {
        let link = {
            href: href,
            title: res.metadata.title,
        }
        if(res?.metadata?.image) {
            link.image = res.metadata.image
        }
        if(res?.metadata?.description) {
            link.description = res.metadata.description
        }
        if(res?.metadata?.author) {
            link.author = res.metadata.author
        }
        if(res?.metadata?.youtube_id) {
            link.youtube_id = res.metadata.youtube_id
        }
        console.log("adding new link", stateKey, link)
        store.addLink({
            room_id: stateKey,
            link: link,
        })
    }

}

onDestroy(() => {
    bodyInput.removeEventListener('scroll', handleScroll);
})

const handleScroll = () => {
    updateContent()
};

async function focusTitleInput() {
    await tick()
    titleInput.focus()
}
function focusOnTitle(e) {
    if(e.key === 'Backspace' && bodyInput.value === '') {
        e.preventDefault()
        //focusTitleInput()
    }
}



let busy = false;
let uploading = false;

$: postText = uploading ? 'Uploading...' : busy ? 'Saving...' : 'Save'


let processed = false;

$: if(isChat && $store.selectedGIF?.view == 'chat') {
    saveChatGIF()
}

$: if(!isChat && reply && $store.selectedGIF?.view == 'board') {
    saveGIFPost()
}



function saveChatGIF() {
    let gif = $store.selectedGIF
    $store.selectedGIF = null
    let mp4 = gif?.media_formats['mp4']
    let content = {
        msgtype: "gif",
        service: $store.features?.gif?.service,
        body: "gif",
        gif: {
            url: gif?.url,
            src: {
                dims: mp4?.dims,
                size: mp4?.size,
                url: mp4?.url,
            }
        }
    }
    if(gif?.description) {
        content.gif['description'] = gif.description
    }

    let post = {
        content: content,
    }

    console.log(post)

    dispatch('new-message', post)
    focusBodyInput()

}

async function saveGIFPost() {
    let gif = $store.selectedGIF
    $store.selectedGIF = null
    let mp4 = gif?.media_formats['mp4']
    let post = {
        transaction_id: `co${Date.now()}`,
        room_id: roomID,
        type: 'space.board.post.reply',
        content: {
            msgtype: "gif",
            service: $store.features?.gif?.service,
            body: "gif",
            gif: {
                url: gif?.url,
                src: {
                    dims: mp4?.dims,
                    size: mp4?.size,
                    url: mp4?.url,
                }
            }
        },
    }
    post.in_thread = threadEvent
    post.is_reply = true
    post.replying_to = replyTo.event_id
    post.content['m.relates_to'] = {
        event_id: replyTo.event_id,
        thread_event_id: threadEvent,
        'rel_type': 'm.nested_reply',
    }

    const res = await savePost(post);
    if(res?.success && res?.event) {
        dispatch('saved', res.event)
    }
}

async function createPost() {

    let title;
    let body;

    // to start with, if links exist, we'll use the first link item's title and
    // body
    if(!isChat && !isSocial && links) {
        if(links[0]?.title?.length > 0) {
            title = links[0].title
        }
    }

    if(!isChat && links) {
        if(links[0]?.description?.length > 0) {
            body = links[0].description
        }
    }

    // fallback for when only image attachments are uploaded
    if(attachments) {
        title = 'attachment'
        body = 'attachment'
    }

    // if user inputs title or body, we'll use those instead
    if(titleInput?.value?.length > 0) {
        title = titleInput.value
    }
    if(bodyInput?.value?.length > 0) {
        body = bodyInput.value
    }

    if(title?.length === 0 && !reply && !editingReply && !isChat && !isSocial) {
        focusTitleInput()
        return
    }

    if(reply && replyTo == null) {
        return
    }

    if(!title && !isChat && !isSocial && !reply) {
        focusTitleInput()
        return
    }

    if(!body) {
        focusBodyInput()
        return
    }


    busy = true

    try {
        let items = []
        if(attachments) {
            uploading = true
            for (const file of attachments) {
                let item = {
                    id: file.id,
                    name: file?.newname ? file.newname : file.name,
                    size: file.size,
                    type: file.type,
                    info: file.info,
                }

                let key = $store.attachments[file.id]?.key

                if(key) {
                    item.key = key
                }
                if(file?.thumbnail?.key) {
                    item.thumbnail = {
                        key: file.thumbnail.key,
                    }
                }

                if(file.info) {
                    item.info = file.info
                }
                items.push(item)
            }
        }

        //replace :emoji: with img urls
        let bo = body

        let save_full = false
        let remaining_words = 0;
        if(body?.length > 1000) {
            save_full = true
            const lastSpaceIndex = body.lastIndexOf(' ', 1000);
            if (lastSpaceIndex > 0) {
                const trimmedText = body.substring(0, lastSpaceIndex);
                bo = trimmedText
                const remainingText = body.substring(lastSpaceIndex);
                const trimmedStr = remainingText.trim();
                const wordsArray = trimmedStr.split(/\S+/);
                remaining_words = wordsArray.length
            } else {
                bo = bo.substring(0, 1000)
            }
        }

        let post = {
            transaction_id: `co${Date.now()}`,
            room_id: roomID,
            type: 'space.board.post',
            content: {
                msgtype: 'post',
                body: bo,
                formatted_body: md.render(replaceEmoji(bo, space_emoji)),
            },
        }

        if(reference) {
            post.reference_event_id = reference.event_id
            post.content['reference'] = {
                event_id: reference.event_id,
                'rel_type': 'reference',
            }
        }

        if(title) {
            post.content['title'] = title
            if(isSocial && title == 'attachment') {
                delete post.content['title']
            }
        }
        /*
        let post = {
            transaction_id: `co${Date.now()}`,
            room_id: roomID,
            type: 'm.room.message',
            content: {
                msgtype: 'm.text',
                format: 'org.matrix.custom.html',
                body: bo,
                formatted_body: editor_content.html,
            },
        }

        if(title) {
            post.content['title'] = title
            let fb = `<p><h3>${title}</h3></p>${editor_content.html}`
            post.content['formatted_body'] = fb
        }
        */


        if(isChat) {
            post.type = 'm.room.message'
            post.content['msgtype'] = 'm.text'
            post.content['body'] = bo
            post.content['format'] = 'org.matrix.custom.html'
            bo = replaceEmoji(bo, space_emoji)
            post.content['formatted_body'] = md.render(bo)
        }

        if(attachments && title == 'attachment' && body == 'attachment') {

            let type = 'm.image'
            if(attachments?.length > 1) {
                type = 'm.images'
            }
            let body = attachments[0].name
            if(attachments?.length > 1) {
                body = `${attachments.length} attachments`
            }

            post.content['body'] = body
            post.content['msgtype'] = type
            delete post.content['title']
        }


        if(save_full) {
            const presignedURL = await getPresignedURL('txt');
            const file = new File([body], presignedURL.key, { type: 'text/plain' });
            await uploadAttachment(file, presignedURL.url);

            const presignedURL_r = await getPresignedURL('txt');
            let rendered = md.render(replaceEmoji(body, space_emoji))
            const rendered_file = new File([rendered], presignedURL_r.key, { type: 'text/plain' });
            await uploadAttachment(rendered_file, presignedURL_r.url);

            post.content['full_body'] = {
                key: presignedURL.key,
                rendered_key: presignedURL_r.key,
                words: remaining_words,
            }
            if(editing) {
                rendered_data = rendered
            }
        }

        if(topic) {
            post.content['topic'] = topic
        }

        let buildReplyBody = ()  => {
            let body = b
            let f = post.content.formatted_body
            let rb = replyTo.content.body
            let rf = replyTo.content.formatted_body
            let rid = replyTo.sender.id

            body = `<mx-reply><blockquote><a
href=\"https://matrix.to/#/!pcWAREjsTZHgkbNqYv:localhost:8480/$Gux1itZL5do01-ADehuqfBNiAMzLDuhd17DgSdjtYNc?via=localhost%3A8480\">In
reply to</a> <a href=\"https://matrix.to/#/${rid}\">@butter:localhost:8480</a><br>${rf}\n</blockquote></mx-reply> <${rid}> ${rb}\n\n${f}`

            return body
        }

        if(reply) {
            post.type = 'space.board.post.reply'
            post.in_thread = threadEvent
            post.is_reply = true
            post.replying_to = replyTo.event_id
            post.content['m.relates_to'] = {
                event_id: replyTo.event_id,
                thread_event_id: threadEvent,
                'rel_type': 'm.nested_reply',
            }
            if(isChat) {
                //post.content.body = `> <${replyTo.sender.id}> ${replyTo.content.body}\n\n${post.content.body}`
                //post.content.formatted_body = `> <${replyTo.sender.id}> ${replyTo.content.formatted_body}\n\n${post.content.formatted_body}`

                post.type = 'm.room.message'
                post.content['m.relates_to'] = {
                    'm.in_reply_to': {
                        event_id: replyTo.event_id,
                        sender: replyTo.sender.id,
                        formatted_body: trimBody(replyTo.content.formatted_body, 100),
                    }
                }
            }
        }

        if(editing) {
            let bod = bodyInput.value
            post.editing = true
            post.content['m.new_content'] = {
                msgtype: 'm.text',
                title: titleInput.value,
                body: post.content.body,
                formatted_body: post.content.formatted_body,
                full_body: post.content.full_body,
            }
            post.content['m.relates_to'] = {
                event_id: editingEvent.event_id,
                'rel_type': 'm.replace',
            }
            post.edited_on = Date.now()
        }

        if(attachments && items.length > 0) {
            post.content.attachments = items
        }

        if(links && links.length > 0) {
            post.content.links = links
        }

        if(isChat && !editing) {
            dispatch('new-message', post)
            busy = false
            reset()
            focusBodyInput()
            return
        }

        data = post
        processed = true


    } catch (error) {
        console.error('Error:', error);
    }
}

let data;
let rendered_data;

$: uploaded = attachments ? attachments?.every(item => $store.attachments[item.id].key != null ) : true

$: if(!isChat && processed && uploaded && !editing) {
    save()
}
$: if(editing && processed) {
    save()
}

async function save() {
    if(data?.content?.attachments) {
        data.content.attachments.forEach(item => {
            item.key = $store.attachments[item.id].key
            delete item.id
        })
    }
    const res = await savePost(data);
    if(res?.success && res?.event) {
        res.event.edited_on = data.edited_on
        if(rendered_data) {
            res.event.content['full_body'].rendered = rendered_data
        }
        dispatch('saved', res.event)
        busy = false
        kill()
    }

}

function reset() {
    busy = false
    uploading = false
    rendered_data = null
    data = null
    if(bodyInput) {
        bodyInput.value = ''
    }
    attachments = []
    links = []
    autosize.update(bodyInput)
    store.deleteEditorState(stateKey)
}

let titleInput;

function handleEnter(e) {
    if(e.key === 'Enter') {
        e.preventDefault()
        if(titleInput.value.length > 0) {
            //editor.focus()
            bodyInput.focus()
        }
    }
}


function handleChatEnter(e) {
    if(!e.shiftKey && e.key === 'Enter' && isChat) {
        e.preventDefault()
        if(!emojiListActive) {
            createPost()
        }
    }
}

let bodyInput;

export async function focusBodyInput() {
    await tick()
    bodyInput.focus()
    updateContent()
}

let titleFocused = false;
let bodyFocused = false;

const handleTitleFocus = () => {
    titleFocused = true;
    updateContent()
};

const handleTitleBlur = () => {
    titleFocused = false;
};

const handleBodyFocus = () => {
    bodyFocused = true;
    updateContent()
};

const handleBodyBlur = () => {
    bodyFocused = false;
};

function updateContent() {
    if(editing) {
        return
    }

    let state = {
        title: titleInput.value || '',
        body: bodyInput.value,
        focus: titleFocused ? 'title' : bodyFocused ? 'body' : null,
        cursor: titleFocused ? titleInput.selectionStart : bodyFocused ? bodyInput.selectionStart : null,
        scroll: bodyInput?.scrollTop > 0 ? bodyInput.scrollTop : null,
    }

    if(replyTo) {
        state.replyTo = replyTo
    }

    if(!isChat) {
        store.updateEditorState({
            room_id: stateKey,
            state: state,
        })
    }
}

async function upload(item) {

    $store.attachments[item.id] = {
        progress: 10,
    }

    const extension = item.name.split('.').pop();
    const presignedURL = await getPresignedURL(extension);

    await UploadWithProgress(presignedURL.url, item, (progress) => {
        $store.attachments[item.id].progress = progress
    }, (error, res) => {
        if (error) {
            console.error('Upload failed:', error);
        } else {
            $store.attachments[item.id].key = presignedURL.key
            console.log($store.attachments[item.id])
        }
    })
}

function attachFiles(e) {
    e.detail.forEach(file => {
        upload(file)
        store.addAttachment({
            room_id: stateKey,
            attachment: file,
        })
    })
    focusBodyInput()
}

function handleTitlePaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (pastedText.includes('\n')) {
        event.preventDefault(); 
    }
}


let emojiListActive = false;
let shortcode = '';

function bodyKeyDown(e) {
    if (isChat && editing && (event.key === 'Escape' || event.key === 'Esc')) {
        kill()
        return
    }
    dispatch('typing', true)
}

function addEmoji(e) {

    let emoji = e.detail + ` `

    if(e.detail.url && e.detail.name) {
        emoji = `:${e.detail.name}: `
    }

    const count = shortcode.length + 1;

    const caretPos = bodyInput.selectionEnd;
    const startPos = Math.max(0, caretPos - count);
    const value = bodyInput.value;
    const newValue = value.substring(0, startPos) + value.substring(caretPos);
    bodyInput.value = newValue;
    bodyInput.selectionEnd = startPos;


    let startPosition = bodyInput.selectionStart;
    let endPosition = bodyInput.selectionEnd;
    bodyInput.value = bodyInput.value.substring(0, startPosition) + emoji + bodyInput.value.substring(endPosition);

    let newCursorPosition = startPosition + emoji.length;
    bodyInput.setSelectionRange(newCursorPosition, newCursorPosition);
    killEmojiList()
    focusBodyInput()
}

function trackCaret(e) {
    setTimeout(() => {
        const pt = bodyInput.value.substring(0, bodyInput.selectionStart);
        const emp = /:(?!.*\s)([a-zA-Z]+\S*)$/;
        const lmp = /\/\S{1,}$/;

        if (emp.test(pt)) {
            let et = pt.match(emp)[0];
            et = et.substring(1);
            shortcode = et;
            emojiListActive = true
        } else if(lmp.test(pt)){
            let et = pt.match(lmp)[0];
            et = et.substring(1);
        } else {
            emojiListActive = false
            shortcode = '';
        }
    }, 0);
}

function killEmojiList() {
    emojiListActive = false
    shortcode = '';
}

function insertEmoji(e) {
    let emoji = e.detail
    if(e.detail?.name && e.detail?.url) {
        emoji = `:${e.detail.name}: `
    }
    let startPosition = bodyInput.selectionStart;
    let endPosition = bodyInput.selectionEnd;
    bodyInput.value = bodyInput.value.substring(0, startPosition) + emoji + bodyInput.value.substring(endPosition);

    let newCursorPosition = startPosition + emoji.length;
    bodyInput.setSelectionRange(newCursorPosition, newCursorPosition);
    //killEmojiList()
    focusBodyInput()
    if(editor) {
        editor.insertEmoji(e.detail)
    }
}

$: attachments = $store.editorStates[stateKey]?.attachments
$: showAttachments = $store.editorStates[stateKey]?.attachments?.length > 0;


$: links = $store.editorStates[stateKey]?.links
$: showLinks = $store.editorStates[stateKey]?.links?.length > 0;

let preview;
let previewing = false;

function togglePreview() {
    if(bodyInput.value.length === 0) {
        focusBodyInput()
        return
    }
    previewing = !previewing
    if(!previewing) {
        focusBodyInput()
    }
}

let lastReplyTo = null;
$: if(replyTo !== lastReplyTo) {
    lastReplyTo = replyTo
    focusBodyInput()
}


let isFullscreen = false;

function toggleFullscreen() {
    isFullscreen = !isFullscreen
}

$: replyToName = replyTo?.sender?.display_name ? replyTo.sender.display_name :
replyTo?.sender?.username ? replyTo.sender.username : ``


let editor_content = null;
function updateEditorContent(e) {
    editor_content = e.detail
    console.log(editor_content)
}

</script>

<section class="composer"
    class:cnbb={isChat}
    class:fs={isFullscreen}
    class:sf={showAttachments}
    class:rep={reply}>

    {#if reply && replyTo}
            <div class="reply-header">
                <div class="fw5 pa3 sm">
                    Replying
                </div>
                <div class="grd-c c-ico ph2 mr2" on:click={kill}>
                    {@html close}
                </div>
            </div>
            <Event event={replyTo} isReply={reply} interactive={false} />
    {/if}

    {#if showAttachments && isChat}
        <Attachments 
            on:attached 
            on:deleted
            isChat={isChat}
            uploading={uploading} 
            roomID={stateKey}/>
    {/if}

    {#if showLinks && isChat}
        <Links uploading={uploading} roomID={stateKey}/>
    {/if}

    <div class="editor-area" 
        class:each={isChat}
        class:eached={isChat && editing}>
        <div class="title-container" 
            class:hide={reply || editingReply || isChat}>
            <div class="">
                <textarea 
                    class="post-title"
                    bind:this={titleInput}
                    placeholder={isSocial ? 'Title (optional)' : 'Title'}
                    maxlength="340"
                    on:paste={handleTitlePaste}
                    on:keydown={handleEnter}
                    on:keydown={updateContent}
                    on:input={updateContent}
                    on:click={updateContent}
                    on:focus={handleTitleFocus}
                    on:blur={handleTitleBlur}
                    disabled={busy}
                ></textarea>
            </div>
            <div class="c-ico ml2 kill" on:click={kill}>
                {@html close}
            </div>
        </div>

        {#if isChat && !editing}
            <div class="pl3 pt3">
                <Attach isChat={isChat} busy={busy} on:attached={attachFiles}/>
            </div>
        {/if}

        <div class="body-container" 
            class:bcnh={isChat}
            class:edbc={editing && isChat}
            class:rp={reply && !isChat}
            class:bs={busy} 
            on:click={focusBodyInput}>
                <textarea 
                    class="post-body"
                    class:pbc={isChat}
                    class:pbce={isChat && editing}
                    class:vis={previewing}
                    class:sh={reply}
                    bind:this={bodyInput}
                    placeholder={placeholder}
                    on:keydown={focusOnTitle}
                    on:keydown={updateContent}
                    on:keydown={trackCaret}
                    on:keydown={bodyKeyDown}
                    on:keydown={handleChatEnter}
                    on:input={updateContent}
                    on:click={updateContent}
                    on:focus={handleBodyFocus}
                    on:blur={handleBodyBlur}
                    disabled={busy}
                ></textarea>
            {#if isChat && editing}
                <div class="esc">
                    escape to cancel • enter to save
                </div>
            {/if}

            {#if previewing}
                <div class="preview">
                    <div class="markdown-c">
                        {@html md.render(replaceEmoji(bodyInput.value, space_emoji))}
                    </div>
                </div>
            {/if}
        </div>
        {#if isChat}
            <InsertEmoji 
                room_alias={room_alias}
                center={false}
                position={"left"} 
                reply={reply} 
                busy={busy} 
                isChat={isChat}
                on:selected={insertEmoji}/>

            {#if gif_enabled}
                <InsertGIF 
                    center={false}
                    isChat={isChat}
                    room_alias={room_alias} />
            {/if}

        {/if}

        {#if isChat && !editing}
            <div class="send ptop">
                <div 
                    on:click={createPost} 
                    class="c-ico grd-c">
                    {@html send}
                </div>
            </div>
        {/if}
    </div>

    {#if showAttachments && !isChat}
        <Attachments 
            on:attached 
            on:deleted 
            isChat={isChat}
            uploading={uploading} 
            roomID={stateKey}/>
    {/if}

    {#if showLinks && !isChat}
        <Links uploading={uploading} roomID={stateKey}/>
    {/if}


    {#if reference}
        <div class="ref fl-co mt3 mh3">
            <div class="ref-header">
                <div class="fw5 ph3 pv2 sm">
                    Referencing
                </div>
                <div class="grd-c c-ico ph2 mr2" on:click={killReference}>
                    {@html close}
                </div>
            </div>
            <Event event={reference} interactive={false} />
        </div>
    {/if}

    <div class="tools fl" class:hide={isChat}>
        <Attach isChat={isChat} busy={busy} on:attached={attachFiles}/>
        <InsertEmoji room_alias={room_alias} reply={reply} busy={busy} on:selected={insertEmoji}/>
        {#if gif_enabled}
            <InsertGIF 
                isChat={false}
                room_alias={room_alias} />
        {/if}
        <div class="fl-o">
        </div>
        <div class="grd mr3">
            <div class:pact={previewing} 
                on:click={togglePreview} 
                bind:this={preview} 
                class="prev c-ico grd-c ph2">
                {@html eye}
            </div>
        </div>
        {#if editing || isSocial}
            <div class="grd-c mr3 href" on:click={kill}>cancel</div>
        {/if}

        <button class="ph3" disabled={busy} on:click={createPost}>
            {postText}
        </button>

    </div>

    {#if emojiListActive && shortcode}
        <EmojiList 
            room_alias={room_alias}
            isChat={isChat}
            target={bodyInput}
            reply={reply || isChat}
            on:selected={addEmoji} 
            shortcode={shortcode} />
    {/if}
</section>

<style>

.composer {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    border-bottom: 1px solid var(--border-1);
    position: relative;
    max-height: 514px;
}

.cnbb {
    border-bottom: none;
}

.fs {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    background-color: var(--bg);
    z-index: 10000;
}

.rep {
    border-top: 1px solid var(--border-1);
    grid-template-rows: auto 1fr auto;
    border-bottom: none;
    -webkit-box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
    -moz-box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
    box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
}

.reply-header {
    border-bottom: 1px solid var(--border-1);
    display: grid;
    grid-template-columns: 1fr auto;
}

.ref {
    border: 1px solid var(--border-1);
}

.ref-header {
    border-bottom: 1px solid var(--border-1);
    display: grid;
    grid-template-columns: 1fr auto;
}
.sf {
    grid-template-rows: 1fr auto auto;
}

.editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow-y: hidden;
}
.each {
    grid-template-columns: auto 1fr auto auto auto;
    grid-template-rows: 1fr;
}

.eached {
    padding-top: 0.5rem;
    grid-template-columns: auto;
    grid-template-rows: auto auto;
    background-color: var(--event-bg-hover);
}

.edbc {
    margin-left: calc(30px + 1rem);
    margin-right: 1rem;
}

.composer {
}

.tools {
    padding: 1rem;
    position: relative;
}
.c-ico {
    height: 22px;
    width: 22px;
}

.title-container {
    padding-right: 1rem;
    padding-left: 1rem;
    display: grid;
    grid-template-columns: 1fr auto;
}

.post-title {
    background-color: transparent;
    border: none;
    width: 100%;
    font-weight: 500;
    padding: 0;
    height: 42px;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
}

.body-container {
    padding-right: 1.5rem;
    cursor: text;
    min-height: 140px;
    position: relative;
}

.bcnh {
    padding-right: 0;
    min-height: 0px;
}

.preview {
    margin-left: 1rem;
    margin-right: 1.5rem;

    font-size: 16px;
    background-color: var(--bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    cursor: auto;
}

.markdown-c {
    padding-top: 0.5rem;
    padding-right: 1rem;
    overflow-y: auto;
    height: 100%;
}


div :global(.preview .emoji){
    height: 20px;
    width: 20px;
    object-fit: contain;
    vertical-align: text-bottom;
}


.rp {
    padding-right: calc(1rem - 6px);
    padding-top: 1rem;
    min-height: 100px;
}

.bs {
    cursor: auto;
}

.post-body {
    background-color: transparent;
    border: none;
    width: 100%;
    padding: 0;
    padding-left: 1rem;
    max-height: 400px;
    overflow-x: hidden;
}
.pbc {
    padding-top: 1rem;
    height: 53px;
}

.pbce {
    border: 1px solid var(--primary);
    font-size: 15px;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    height: 20px;
}

.pbfs {
    max-height: 100%;
}

.sh {
    max-height: 300px;
}

.ex {
    font-size: small;
    color: var(--primary);
}

.kill {
    margin-top: 1rem;
}

button {
    padding: 0.25rem 0.5rem;
}
.prev {
    opacity: 0.4;
    transition: 0.1s;
    height: 18px;
    width: 18px;
}

.prev:hover {
    opacity: 0.8;
}
.pact {
    opacity: 1;
}

.hide {
    display: none;
}

.vis {
    visibility: hidden;
}

* {
    font-family: "Inter", "Twemoji", "Apple Color Emoji", "Segoe UI Emoji", "Arial", "Helvetica", sans-serif, "STIXGeneral", "Noto Color Emoji";
}

.fullscreen {
    margin-top: 16px;
    width: 18px;
    height: 18px;
}

.esc {
    font-size: 10px;
    margin-left: 1rem;
    margin-bottom: 0.5rem;
}
.ptop {
    padding: 0.5rem;
    margin-top: 9px;
    margin-right: 0.5rem;
}
</style>
