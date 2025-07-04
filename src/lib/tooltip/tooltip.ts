import tippy from 'tippy.js';

export function tooltip(target, options) {
    if(!options?.content) {
        return
    }

    const config = {
        content: options.content,
        placement: options?.placement || 'top',
        arrow: options?.arrow || true,
        duration: options?.duration || 1,
        offset: 0,
        theme: options?.theme || 'inline',
    };

    if(options?.offset) {
        config.offset = options.offset
    }

    const tooltip = tippy(target, config)

    return {
        update(options) {
            tooltip.setProps(options)
        },
        destroy() {
            tooltip.destroy()
        }
    }

}
