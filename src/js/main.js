const main = async () => {
    const prop = {
        url                 : false,
        lock                : true,
        cookies             : []
    }

    const initProperty = async () => {
        const host = await getCurrentHost()
        const url = host.origin.replace(/\/$|$/, '/');

        prop.url            = url

        renderSearchBar()
    }

    const initBtnListener = async () => {
        const btnCookie     = document.getElementById('btn-cookie')
        const btnDownload   = document.getElementById('btn-download')
        const btnCopy       = document.getElementById('btn-copy')
        const btnLock       = document.getElementById('btn-lock')

        btnCookie.addEventListener("click", actionBtnCookie)
        btnDownload.addEventListener("click", actionBtnDownload)
        btnCopy.addEventListener("click", actionBtnCopy)
        btnLock.addEventListener("click", actionBtnLock)
    }

    const actionBtnCookie = async () => {
        const {url} = prop
        await permission(url)
        prop.cookies = await getCookies(url)

        renderRows()
    }

    const actionBtnDownload = async () => {
        showToast('Still In Development!', 'warning')
    }

    const actionBtnCopy = () => {
        showToast('Copied')
        const cookie = constructCookieSingleLine(prop.cookies) || []
        navigator.clipboard.writeText(cookie)
    }

    const actionBtnLock = () => {
        prop.lock = !prop.lock
        $('#url').prop('disabled', prop.lock)
    }

    const permission = async (url) => {
        const permisionPayload = {
            permissions: ['cookies'],
            origins: [url]
        }
        const granted = await chrome.permissions.contains(permisionPayload)
        if (!granted) {
            await chrome.permissions.request(permisionPayload)
        }
    }

    const getCurrentHost = async () => {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        })
        const url = new URL(tabs[0].url)
        return url
    }

    const getCookies = async (url) => {
        const cookies = await chrome.cookies.getAll({
            url: url
        })
        return cookies
    }

    const constructCookieSingleLine = (cookies) => {
        let cookiePlain = ''
        for (const cookie of cookies) {
            const {name, value} = cookie
            cookiePlain += `${name}=${value};`
        }
        cookiePlain = cookiePlain ? cookiePlain.slice(0, -1) : cookiePlain
        return cookiePlain
    }

    const showToast = (message, level='info') => {
        level = `toast-${level}`
        $(`#${level} .message`).html(message);
        $(`#${level}`).toast('show');
    }

    const templateRow = (cookie) => {
        const {domain, name, value, httpOnly} = cookie
        return `
            <tr class="row mx-0">
                <td scope="row" class="col-2" title="${domain}">${domain}</td>
                <td scope="row" class="col-2" title="${httpOnly}">${httpOnly}</td>
                <td scope="row" class="col-2" title="${name}">${name}</td>
                <td scope="row" class="col-6" title="${value}">${value}</td>
            </tr>
        `
    }

    const templateEmptyRow = () => {
        return `
            <tr>
                <td class="text-center" id="empty" colspan="3">No Cookies Data</td>
            </tr>
        `
    }

    const renderRows = () => {
        let render = ''
        for (const cookie of prop.cookies) {
            render += templateRow(cookie)
        }
        render = render || templateEmptyRow()

        $('#rows').html('');
        $('#rows').html(render)
    }

    const renderSearchBar = () => {
        $('#url').val(prop.url || '')
    }

    await initProperty()
    await initBtnListener()
}

window.addEventListener('load', async () => {
    await main()
})