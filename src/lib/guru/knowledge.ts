/**
 * GURU's general travel knowledge — a compact catalogue the model uses to
 * recognise places and treks. This is NOT a list of what Time2Travel sells:
 * verified offerings come from the database at request time
 * (see business-context.ts). Details such as difficulty, duration, season,
 * visas and trail status change, so GURU must treat them as approximate.
 */

export const DOMESTIC_KNOWLEDGE = `
Himachal Pradesh: Shimla, Manali, Kasol, Kullu, Spiti Valley, Kinnaur, Dharamshala, McLeod Ganj, Dalhousie, Chamba, Bir Billing, Tirthan Valley, Jibhi, Kasauli, Chail.
Uttarakhand: Rishikesh, Haridwar, Mussoorie, Nainital, Auli, Chopta, Valley of Flowers, Kedarnath, Badrinath, Jim Corbett.
Jammu & Kashmir: Srinagar, Gulmarg, Pahalgam, Sonamarg, Jammu, Vaishno Devi.
Ladakh: Leh, Nubra Valley, Pangong Lake, Tso Moriri, Khardung La, Magnetic Hill, monasteries, motorcycle and road trips.
Rajasthan: Jaipur, Udaipur, Jaisalmer, Jodhpur, Pushkar, Mount Abu, Bikaner.
Kerala & South India: Munnar, Alleppey, Kochi, Wayanad, Thekkady, Ooty, Coorg, Mysore, Hampi, Pondicherry, Goa.
Northeast India: Meghalaya (Shillong, Cherrapunji), Kaziranga, Sikkim (Gangtok), Darjeeling, Arunachal Pradesh (Tawang), Nagaland.
Other: Agra, Varanasi, Rann of Kutch, Andaman & Nicobar Islands, Lakshadweep, Maharashtra, Gujarat, Odisha.
`.trim();

export const TREK_KNOWLEDGE = `
Himachal Pradesh: Triund, Hampta Pass, Bhrigu Lake, Beas Kund, Pin Parvati Pass, Kheerganga, Indrahar Pass, Sar Pass, Kareri Lake, Bhaba Pass.
Uttarakhand: Kedarkantha, Brahmatal, Dayara Bugyal, Kuari Pass, Chopta-Chandrashila, Valley of Flowers, Roopkund (access is restricted and rules change — always say to confirm with the forest department / an authorised operator).
Kashmir & Ladakh: Kashmir Great Lakes, Tarsar Marsar, Markha Valley.
Other adventure: camping, scenic road trips, mountain biking, paragliding (e.g. Bir Billing), rafting (e.g. Rishikesh), wildlife safaris, photography trips, nature walks, multi-day hiking, group adventure travel.
`.trim();

export const INTERNATIONAL_KNOWLEDGE = `
Southeast Asia: Thailand, Bali (Indonesia), Singapore, Malaysia, Vietnam, Cambodia, Philippines.
Middle East: Dubai, Abu Dhabi, other UAE emirates, Oman.
South Asia: Nepal, Bhutan, Sri Lanka, Maldives.
East Asia: Japan, South Korea.
Europe: Switzerland, France, Italy, Spain, Greece, Austria.
Other: Australia, New Zealand, Egypt, Turkey, South Africa, Mauritius, Seychelles.
`.trim();
