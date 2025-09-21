import { STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { BlackListData } from "./black-list-models";

export class BlackListStorage {

    public channelIsTurnedOn: boolean = false;
    public channels: string[] = [];

    public keywordsIsTurnedOn: boolean = false;
    public keywords: string[] = [];

    public phrasesIsTurnedOn: boolean = false;
    public phrases: string[] = [];

    async init(): Promise<void> {
        const storageKeysData = []
    
        const storageKeysTurnedOn = [
            STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
            STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
            STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
        ]
    
        var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);
    
        this.channelIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON];
        if (this.channelIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_CHANNELS);
            
        }
    
        this.keywordsIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON];
        if (this.keywordsIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_KEYWORDS)
        }
    
        this.phrasesIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON];
        if (this.phrasesIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_PHRASES)
        }
        
        const storageBlackLists = await chrome.storage.sync.get(storageKeysData);

        this.channels = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
        this.keywords = storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [];
        this.phrases = storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? [];

        this.handler();
    }


    public setBlackListChannel(channelName: string, channelNickname: string): void {
        
    }

    private handler() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") return;

            if (this.setBooleans(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, changes)) return;
            if (this.setBooleans(STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, changes)) return;
            if (this.setBooleans(STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, changes)) return;
        });
    }

    private setBooleans(key: string, changes: any): boolean {
        if (key in changes) {
            const { oldValue, newValue } = changes[key];

            if (this.isBoolean(newValue)) {
                this.channelIsTurnedOn = newValue;
                return true;
            }
        }

        return false;
    }

    private isBoolean(value: unknown): value is boolean {
        return typeof value === "boolean";
    }

    
    public static blackChannels: string[] = [
        '@arestovych',
        '@unian',
        '@doctorlazarev',
        '@Gordonua',
        '@news24tvua',
        '@yulialatynina71',
        '@dhistory',
        '@DmytriyGordon',
        '@vdud',
        '@sobchak',
        '@mmdcrew',
        '@apogovorit',
        '@AlexanderSokolovskiy',
        '@apogovorit',
        '@NadinStrelets',
        '@skazhigordeevoy',
        '@frametamer6',
        '@VPISKA',
        '@Metametrica',
        '@tvrain',
        '@FAMETIMETV',
        '@dzharakhov',
        '@gazgolder',
        '@Liasan',
        '@khodorkovskylive',
        '@dwrussian',
        '@RadioSvoboda',
        '@historyofeverything_ru',
        '@historyofeverything_ua',
        '@drhistory',
        '@posle_zavtra',
        '@Curious_Cat',
        '@StalinHDTV',
        '@50voprosov',
        '@uzhukoffa',
        '@SENSUSCOMMUNE',
        '@FirstScientific',
        '@RTVItainment',
        '@AndersenPeople',
        '@maestro_ponasenkov',
        '@AlexeyShcherbakov',
        '@LABELcom',
        '@plyoushki',
        '@filipovskiy13',
        '@ComedyClubRussia',
        '@AntonovAntonov',
        '@GoodTimesBadTimesRU',
        '@Luchshee_s_Papichem',
        '@user-fe5yb7mu5g',
        '@webka_papicha',
        '@HexEye228',
        '@Roflany_Papicha',
        '@papich_govorit',
        '@SpitefulDick',
        '@GonzichJr',
        '@KazinychZapasnoy',
        '@arthasludik',
        '@AniSpace1',
        '@hub_anime2944',
        '@VelutLunaReview',
        '@CEHR',
        '@BlackCabinet',
        '@KINOKRITIKA',
        '@FiveTop5',
        '@Radio-Svoboda',
        '@bbcnewsrussian',
        '@AKIpressnews',
        '@kpru',
        '@CurrentTimeTV',
        '@ictv',
        '@euronewsru',
        '@MackNack',
        '@SHAMAN_ME',
        '@radio-svoboda-novosti',
        '@yashin_russia',
        '@NavalnyLiveChannel',
        '@Popularpolitics',
        '@kinopoisk',
        '@artforintrovert',
        '@ApostropheTV',
        '@beltavideo',
        '@omtvreal',
        '@standupclubru',
        '@NavalnyRu',
        '@ryndych123',
        '@GoBChannelWorld',
        '@voitenkoqna',
        '@IgorVoitenkoVlogs',
        '@igorvoitenko101',
        '@dnevnik_hacha',
        '@telblognet',
        '@dvargunin',
        '@olegmongol',
        '@KIRILLSARYCHEV',
        '@SarychevLife',
        '@YuriyRomanenko_Ukraine',
        '@pryamiy',
        '@RomanTsymbaliuk',
        '@ALPHAMEDIACHANNEL',
        '@Kazinych',
        '@SuperSharij',
        '@varlamov',
        '@FeyginLive',
        '@Yuri_Velikiy',
        '@Max_Katz',
        '@pleasantildar',
        '@BeremennaV16UA',
        '@Zubarefffchina',
        '@ZubarefffFather',
        '@ZubarefffMoments',
        '@ZubarefffREACT',
        '@zubarefff',
        '@zubarefchill',
        '@rofls__Zubarefff',
        '@HESUSDED',
        '@HESUSSTREAM',
        '@uebermarginal',
        '@MINAEVLIVE',
        '@Vladimir_Loginov',
        '@toplesofficial',
        '@UtopiaShow',
        '@historyonmap',
        '@sobolev4787',
        '@ultimatetheory',
        '@EpicHistoryRu',
        '@jolygolf8269',
        '@Millenniumeye23',
        '@ArturSharifov',
        '@littlebig',
        '@A4a4a4a4',
        '@MrTopatella',
        '@mudrostiarestovycha',
        '@AlexeyPchelkin',
        '@TheJoves',
        '@Amway921WOT',
        '@Stanlock',
        '@WorldOfTanksOfficialChannel',
        '@LeBwaWOT',
        '@papichvtrende',
        '@UgonHarleev1',
        '@user-qm6bq8il4g',
        '@papichwtf4511',
        '@Gaze_of_the_Greatest',
        '@best_carl',
        '@topashowfan',
        '@HiddenPool',
        '@cheand',
        '@abridge',
        '@IgorMedov',
        '@uchannelrussia',
        '@SNAILKICK',
        '@onlinerby',
        '@gleblisicin',
        '@thebestmom3034',
        '@OneKing',
        '@shedshelyuha',
        '@serzh_dur_dachnik',
        '@zhivovfitness',
        '@Igor_Link',
        '@Chamade',
        '@Zhmil3133',
        '@user-hh9ot5mu6q',
        '@user-qx6kj8xq2y',
        '@Wylsacom',
        '@holovanov',
        '@UKRAINETODAY24',
        '@novynyua',
        '@sonnyk7988',
        '@Droiderru',
        '@ButKorn',
        '@SemenikhinDenis',
        '@flynutrition',
        '@itpediachannel'
    ]

    public static blackNameWords: string[] = [
        'арестович',
        'арестовича',
        'arestovich',
        'папич',
        'папича',
        'наруто',
        'naruto',
        'гоблин',
        'пучков',
        'кедми',
        'сарычев',
        'соловьев',
        'путин',
        'путина',
        'зубарев',
        'понасенков',
        'панасенков',
        'понасенко',
        'хесус',
        'убермаргинал',
        'zubarefff',
        'arthas',
        'evilarthas',
        'соловьёв',
        'пацанки',
        'соболев',
        'wylsacom',
        'sonnyk',
        'bushwacker',
        'butkorn',
        'семенихин',
        'лебедев',
        'дудь'
    ]

    public static blackPhrases: string[] = [
        'беременна в 13',
        'беременна в 14',
        'беременна в 15',
        'беременна в 16',
        'беpеменна в 16',
        'беременна в 17',
        'мужское женское',
        'неравный брак',
        'ян топлес',
        'ай как просто',
        'ай, как просто',
        'утопия шоу',
        'world of tanks',
        'дядя богдан',
        'utopia show',
        'максим кац',
        'идущий к реке',
        'денис семенихин'
    ]
}
