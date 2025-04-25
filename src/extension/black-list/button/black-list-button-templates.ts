export const TEMPLATE = `
<div id="black-list-cross" style="display: flex; align-items: center;">
    <style>
        :root {
            --button-main-color-black: #F0331B;
            --button-cross-color-black: #FEFEFE;
            --button-main-color-black-hover: #FEFEFE;
            --button-cross-color-black-hover: #111111;
            
            --button-main-color-light: #F0331B;
            --button-cross-color-light: #FEFEFE;
            --button-main-color-light-hover: #111111;
            --button-cross-color-light-hover: #FEFEFE;
            
        }

        .black-list svg {
            cursor: pointer;
            --button-main-color: var(--button-main-color-light);
            --button-cross-color: var(--button-cross-color-light);
        }

        .black-list svg:hover {
            --button-main-color: var(--button-main-color-light-hover);
            --button-cross-color: var(--button-cross-color-light-hover);
        }
    </style>
    <div class="black-list">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="-19.5" y="-19.5" width="433" height="104" rx="4.5" stroke="#9747FF" stroke-dasharray="10 5"/>
            <rect width="16" height="16" rx="8" fill="var(--button-main-color)"/>
            <path d="M4.21216 11.7886L11.7883 4.21243" stroke="var(--button-cross-color)" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M11.7883 11.7886L4.21219 4.21243" stroke="var(--button-cross-color)" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
    </div>
</div>
`