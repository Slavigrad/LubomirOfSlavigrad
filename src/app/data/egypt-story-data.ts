/**
 * Egypt Story Data
 *
 * Data structure for the "I Wandered Through Egypt" memoir.
 * This file contains all story content separated from presentation logic.
 */

/**
 * Represents metadata information displayed with icons
 */
export interface StoryMetadata {
  icon: string; // SVG path data
  text: string;
}

/**
 * Represents author information
 */
export interface StoryAuthor {
  name: string;
  links?: {
    linkedin?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
  };
}

/**
 * Represents a section within a chapter
 */
export interface StorySection {
  title: string | null; // Section title (null if no title)
  paragraphs: string[];
}

/**
 * Represents a chapter in the story
 */
export interface StoryChapter {
  number: number;
  title: string;
  theme?: 'primary' | 'secondary' | 'accent' | 'orange' // Optional theme for color coding
  sections: StorySection[]; // Chapters now contain sections
}

/**
 * Represents a quote with attribution
 */
export interface StoryQuote {
  text: string;
  author: string;
}

/**
 * Main story data structure
 */
export interface Story {
  title: string;
  subtitle?: string; // Optional subtitle for the introduction
  metadata: StoryMetadata[];
  author?: StoryAuthor; // Optional author information
  introduction: string;
  chapters: StoryChapter[];
  closingQuote?: StoryQuote; // Optional closing quote
}

/**
 * Egypt Memoir - "I Wandered Through Egypt"
 *
 * A true story of survival, adventure, and self-discovery in the Egyptian desert.
 * Written by Lubomir Dobrovodsky about his journey in June 2004.
 */
export const EGYPT_STORY: Story = {
  title: 'I Wandered Through Egypt',

  subtitle: 'Alone. 16 days. 10 days without belongings, ID, or money. Wearing only a galabija and sandals. 3 days crossing the desert - 2 without a drop of water.',

  metadata: [
    {
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      text: 'A Chronicle from the Archives'
    },
    {
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      text: 'A Journey Through Time'
    }
  ],

  author: {
    name: 'Lubomir Dobrovodsky',
    links: {
      linkedin: 'https://www.linkedin.com/in/lubomir-dobrovodsky/',
      website: 'https://www.slavigrad.net',
      instagram: 'https://instagram.com/slavigrad',
      twitter: 'https://x.com/slavigrad'
    }
  },

  introduction: `My journey took me from Cairo all the way to Bahariya, an oasis 300 kilometers away.

Back in 2002, the year I graduated from high school, I got seriously ill. I was diagnosed with an incurable spinal inflammation - Ankylosing Spondylitis (Morbus Bechterew). For six months, I was confined to a wheelchair, enduring relentless pain. Then I spent another year struggling on crutches, slowly and painfully recovering. Even afterward, severe backaches often tormented me.

By 2003, when I finally regained the ability to walk normally, I enrolled at a university in Vienna to study computer science.

But after just two semesters, I dropped out. I couldn't concentrate, couldn't find peace; the persistent pain haunted me, and dissatisfaction consumed my mind. I desperately needed to clear my mind and get some fresh air for my thoughts.

I needed a change of scenery - somewhere expansive, open, and tranquil.

Where better to clear your mind than in the desert?

So, I decided to travel to Egypt.

On June 10th, 2004, just before boarding my flight, I sent a quick text message to my friends:

"I'm going to Egypt."

Then, for the whole two weeks, no one heard a word from me.

Not even my family…`,

  chapters: [
    {
      number: 1,
      title: 'Arrival in Cairo',
      theme: 'primary',
      sections: [
        {
          title: null,
          paragraphs: [
            'I landed in Cairo around 4 a.m. Exhausted, sleepy, but strangely satisfied.',
            'As I stepped out into the predawn chaos, pondering my next move, a group of hustlers quickly surrounded me. Smooth-talking and persuasive, they launched into their spiel, promising me food, accommodation, and guided tours to all the must-see places.',
            'I was 20 years old - naive, overwhelmed, inexperienced, caught off guard, a bit nervous, and honestly, somewhat intimidated.',
            'These guys were tall, tough-looking, and incredibly persistent. I decided to "go along" with their offers, even though I knew it would take most of my money. I just hoped I\'d figure something out later.',
            'First, they took me to a hotel where I crashed for a few hours. When I woke up, we began touring the sights. That part wasn\'t actually too bad. Sure, I knew hanging out with these guys wouldn\'t be cheap, but I decided to enjoy it anyway.'
          ]
        }
,
        {
          title: 'Beneath the Shadow of the Pyramids',
          paragraphs: [
            'Our first stop was the Great Pyramid of Giza - truly colossal, constructed from over two million stone blocks, or so they say. The nearby Pyramid of Khafre wasn\'t any less impressive, though its base was exactly fifteen meters shorter than that of the Great Pyramid, the height difference was only three meters. Then there was Menkaure\'s Pyramid, the smallest of the trio but still awe-inspiring.',
            'Camel rides were offered at outrageous tourist prices, of course. "Ah, to hell with money!" I thought, and hopped on for a quick ride before heading over to see the Sphinx. Majestic in her own right, she guarded the road to Khafre\'s Pyramid and towered around 20 meters above us.',
            'Later, we moved on to Saqqara, home to some of Egypt\'s richest archaeological treasures. More pyramids rose there: Djoser\'s, Unas\'s, and Teti\'s, alongside tombs - final resting places of long-forgotten nobles - that I eagerly explored. Next was Memphis, once the proud capital of ancient Egypt. Time had reduced it to ruins, yet its history still lingered in the air.',
            'Eventually, we reached the Egyptian Museum, which reportedly houses over 120,000 exhibits. I glimpsed the most fascinating pieces - the famed treasures of Tutankhamun, statues, coffins, and an assortment of wonders. After our museum visit, we headed to the markets.'
          ]
        },
        {
          title: 'Shopping: A Robe and a Debt',
          paragraphs: [
            'At the market, I ended up buying a galabija (a traditional Egyptian garment). Although I was entirely out of cash by then, my companions pressured me into buying it anyway.',
            '"Just borrow some money!" they insisted.',
            'So, against my better judgment, I borrowed money and got the galabija. I just wanted to avoid arguing with them, and honestly? I liked it.',
            'Later, we had dinner and headed back to the hotel.',
            'Back in my room, with the bit of money I had left running dry, my new "friends" cheerfully informed me they\'d pick me up in the morning to arrange another expensive tour. It was clear they intended to milk me dry, and I desperately needed a way out.',
            'How would I shake them off?',
            'I was going to disappear.',
            'I decided that the simplest solution was to vanish quietly into the night and start my own adventure.'
          ]
        }
      ]
    },
    {
      number: 2,
      title: 'Midnight Escape into the Desert',
      theme: 'secondary',
      sections: [
        {
          title: null,
          paragraphs: [
            'At midnight, quiet as a shadow, I slipped out of the hotel unnoticed. Perfect!',
            'My hotel was located somewhere in the north, above the city center, and the pyramids - and the desert lay to the south. So, naturally, that\'s the direction I chose.',
            'As I wandered through the heart of Cairo, I met plenty of people. They were friendly and outgoing, and we chatted easily in English about all sorts of things. I received several invitations to parties along the way, but politely declined each one - I had a desert to reach.'
          ]
        },
        {
          title: 'An Encounter Beneath the Stars',
          paragraphs: [
            'Just before dawn, I bumped into some policemen armed with machine guns slung casually over their shoulders.',
            '"Hello, my friend!" greeted one of them in English, smiling warmly.',
            '"How are you?"',
            '"Fine!" I replied cheerfully.',
            'Egyptian police officers turned out to be extremely friendly, and these men were no exception. Actually, they were the first policemen I\'d met in Egypt, but certainly not the last. Curious about my story, they asked where I was from, what brought me here, and a bunch of other questions. Soon we were chatting comfortably, like old friends catching up. They even invited me for tea.',
            'Eventually, they asked, "Are you a Muslim or a Christian?"',
            'I didn\'t feel like explaining my lack of religious beliefs, so I simply said, "Christian."',
            '"You are Christian, I am Muslim. We are friends!" one of them proclaimed enthusiastically.',
            'We shook hands, laughing heartily. What a cheerful bunch!',
            'When I mentioned my intention to head south toward the pyramids, they promptly offered to drive me to a hotel near them, where there was a security checkpoint.',
            'Excellent!',
            'That saved me some walking and also provided welcome relief from those persistent hustlers. After arriving, we shared a few more stories over tea. Soon enough, we said goodbye, and I continued onward.'
          ]
        },
        {
          title: 'The Desert Awaits',
          paragraphs: [
            'I longed for the desert, and now it was finally within reach…',
            'A few hours later, I stood at the desert\'s edge. The view was spectacular. Vast, endless, untouched.',
            'Hoisting my backpack onto my shoulder, I stepped onto the sand and walked until nightfall. The city, along with its hustlers, was now far behind me. At last, I was free.'
          ]
        }
      ]
    }
,
    {
      number: 3,
      title: 'The Desert',
      theme: 'accent',
      sections: [
        {
          title: null,
          paragraphs: [
            'As darkness fell, exhaustion caught up with me. Finding a secluded spot, clearly untouched by visitors, I lay down and slept under the stars.',
            'When morning came, I was eager to venture deeper into the desert.'
          ]
        },
        {
          title: 'Whispers in the Sand',
          paragraphs: [
            'Since I was basically broke, carrying no food and only about half a liter of water left, I decided to abandon my backpack and everything in it—maps, sleeping bag, plane ticket, the remaining cash, and my ID.',
            'If this was going to be an adventure, I might as well go all in! Wearing nothing but my galabeya and sandals, I finished off my last bit of water, grabbed my compass, and boldly marched onward.'
          ]
        },
        {
          title: 'The Sun God\'s Trial',
          paragraphs: [
            'I walked the whole day into the night. There was nowhere to take shelter, and the heat was merciless—around 40 to 50 degrees Celsius. It sapped every ounce of my strength. When night finally arrived, relieved from the blazing sun, I simply collapsed on the spot where I stopped, falling immediately into sleep without even a blanket.',
            'The next morning, as soon as I felt the sun\'s heat again, I pushed forward. It occurred to me that traveling by night would be smarter, but I\'d need a safe place to hide out during the day. Unfortunately, I found no such place.',
            'Soon enough, the sun became unbearable. Over twenty-four hours had passed without food or water. My throat was bone dry, and my strength drained completely. In sheer desperation, I yelled helplessly into the wind.',
            'A crisis struck. My legs buckled beneath me, and I fell to the sand, unable to move. I lost all sense of time. Minutes? Hours? Everything blended together in a haze of heat and pain.',
            '"I guess this is it," I thought. "My adventure ends sooner than expected."',
            'I was sure I was dying, dehydrated, and suffering from heatstroke.',
            'I quietly offered a small prayer to the universe, grateful for my brief yet beautiful existence on Earth.',
            '"It was good to be here… on Earth."',
            'But death was taking a frustratingly long time.',
            'I thought I\'d pass out and dry up on the sand, but nothing of that sort happened. Eventually, I got bored waiting to die and realized I didn\'t want to go like this - slowly and miserably. Better to die searching for water than lying here waiting for it. That thought gave me a sudden jolt of energy, but which direction should I go?'
          ]
        },
        {
          title: 'Crawling Toward the Edge of Existence',
          paragraphs: [
            'I scanned the horizon, uncertain. Trusting my intuition, I glanced at the compass. North. North felt right.',
            'I began stumbling northward. After only a few minutes, I suddenly saw buildings in the distance - a factory, perhaps even a town! Salvation! Still several kilometers away, but there was no other option. I struggled onward, stopping to rest after every few steps.',
            'Walk. Rest. Crawl. Rest. Repeat.'
          ]
        },
        {
          title: 'The Watchers at the Gate – Keepers of Water',
          paragraphs: [
            'Hours passed before I finally reached the factory and staggered inside. Security guards stood there, surprised but welcoming - and most importantly, they had water!',
            'I was saved.',
            'They stared at me - this half-dead, sand-covered figure who had emerged from the dunes like something out of a forgotten legend.',
            'I didn\'t care what they thought.',
            'I reached for the water.'
          ]
        }
      ]
    },
    {
      number: 4,
      title: 'Between the City and the Desert – Oasis Bound',
      theme: 'primary',
      sections: [
        {
          title: null,
          paragraphs: [
            'I began drinking slowly, cautiously—but immediately threw up. Confused, I tried another sip, only to vomit again. What was happening?',
            '"Drink in small sips," one of the guards advised me.',
            'Right. Small sips.',
            'So, carefully, I took tiny sips, pausing often, letting my body recover. Gradually, it stayed down.',
            'Meanwhile, the security guards looked at me in disbelief, struggling to believe I\'d actually walked all the way from Cairo through the desert to their doorstep.',
            '"You walked here? From Cairo? Through the desert?"',
            'Hell, I barely believed it myself. Well, I also crawled.',
            'After about an hour of cautious sipping, I felt somewhat human again, at least enough to continue.',
            'Not great, not terrible - not dying anymore.'
          ]
        },
        {
          title: 'A Ride to Nowhere',
          paragraphs: [
            'Though still weak and dazed from heatstroke, I decided to move forward. I couldn\'t bear the scorching sun much longer, so I flagged down a passing car, and the driver dropped me near an abandoned building. It turned out it wasn\'t entirely abandoned—there was ongoing construction.',
            'Unnoticed, I crept inside, found a quiet corner away from the workers, and collapsed into the shade. Completely drained by sunstroke, I fell asleep immediately and didn\'t wake until evening. When I finally awoke, I felt somewhat refreshed and decided to continue my journey.'
          ]
        },
        {
          title: 'A Night of Doubt',
          paragraphs: [
            'At the far end of the construction site, I was halted by another group of security guards. Beyond that point, there was nothing—only the endless expanse of desert.',
            'It was deep into the night, and they were puzzled by my presence.',
            '"I\'m heading to Bahariya," I told them.',
            '"The oasis is about three hundred kilometers away. Hitchhiking."',
            '"That\'s impossible! You cannot go! It\'s dangerous. You are dangerous! There are thieves, and to the police, you will look like a thief yourself!" one of them insisted anxiously.',
            'Yet, moments later, their sternness softened into kindness.',
            '"Come, sit down. Don\'t worry! You are a friend!" they reassured me warmly, offering water, soup, and bread with cheese.',
            'Revived by their generosity, I gratefully accepted the meal and their kindness.'
          ]
        },
        {
          title: 'Back to Cairo, Again',
          paragraphs: [
            'Eventually, realizing my stubbornness, they arranged a ride back to Cairo for me. Ironically, I was headed exactly back where I\'d fled from. Well, what could I do?',
            'They even slipped me some money, and I spent the night nearby. Truly, you\'re never completely alone here. A local guy noticed my empty stomach and handed me a delicious Arabic bread stuffed with fresh vegetables. In the morning, I traveled to the city of 6th of October, just west of Cairo. From there, I was closer again to Bahariya.',
            'Another adventure awaited, another step closer to my destination.'
          ]
        },
        {
          title: 'The Impossible Ride',
          paragraphs: [
            'New luck awaited me there, in the shape of friendly locals who eagerly helped me find transportation further on. They drove me beyond the outskirts of town, and from there, I determinedly marched toward the spot where I had ended up the day before—right at the edge of civilization.',
            'After several hours, another group stopped me as I approached the boundary between town and desert. They were headed back to Cairo and offered me a lift. But returning to where I\'d started was the last thing I wanted. My path lay in the opposite direction.',
            '"I\'m going to Bahariya. I\'ll hitchhike," I explained.',
            '"That\'s impossible!" their leader exclaimed, shaking his head vigorously. "No cars ever pass through here! Nobody stops here!"',
            'I stubbornly stood my ground. And just then, as if on cue, a small car appeared on the horizon. I eagerly waved it down. It stopped! But the driver wasn\'t going to the oasis; his destination was a nearby airport.',
            'He exchanged a few words with the security chief, and after they talked things over, everyone departed, clearly understanding I wasn\'t budging.',
            'Finally, I was alone.',
            'I was not discouraged. Even if the car wasn\'t headed in my direction, it was proof—proof that impossible things can happen.'
          ]
        }
      ]
    }
,
    {
      number: 5,
      title: 'Hitchhiking to Bahariya',
      sections: [
        {
          title: null,
          paragraphs: [
            'I stood there, at the border between civilization and endless sand, calmly waiting. Sure, statistically, hitchhiking from this spot was impossible. But who cares about statistics? I relied purely on the impossible. Completely at ease, I waited patiently—and soon enough, against all odds, a car appeared. It was small and green, with two older men sitting up front. I ran ahead eagerly, waving them down.',
            '"Wahat?" I asked, hoping they\'d understand I meant the oasis.',
            'The driver nodded.',
            '"Can you take me? Please!"'
          ]
        },
        {
          title: 'The Oasis Road',
          paragraphs: [
            'Without hesitation, the passenger shifted to the middle seat, and I squeezed in, grinning broadly. As we drove off, I chuckled inwardly, amused that a car had appeared precisely when I needed it most. After a few hours on the road, we stopped at a small roadside café in the middle of nowhere, which doubled as a rest stop for buses and weary travelers.',
            'Besides us, only one bus and one other car were parked there.',
            '"Not much traffic around here," I thought with amusement.',
            'The men who had given me a ride explained they weren\'t going directly to Bahariya, but assured me that the bus would take me there, as it regularly stopped here. Now my only problem was figuring out how to get aboard without money.',
            'I rested briefly in the shade, chatting casually with locals and even a French woman heading to Cairo. One friendly Egyptian took pity on me and spoke with the bus driver, convincing him to let me ride for free. After some negotiation, the driver agreed. All obstacles vanished.',
            'Stepping off the bus later, I wore a triumphant grin: I\'d made it! I was finally here!'
          ]
        }
      ]
    },
    {
      number: 6,
      title: 'Bahariya',
      sections: [
        {
          title: null,
          paragraphs: [
            'The first person I met in Bahariya was a hotel employee who quickly ushered me into a car and drove me toward his hotel without giving me a chance to speak. I didn\'t protest—at least it was a free ride into town—but I politely declined when it came to the room. They probably wouldn\'t give me one for free anyway.'
          ]
        },
        {
          title: 'Palms, Springs, and the Black Mountain Hotel',
          paragraphs: [
            'Instead, I decided to wander through the village on my own. I admired the beautiful palms, met friendly locals, drank from a hot spring, and enjoyed an unforgettable sunset. Once darkness had fallen, I climbed onto the rocky slopes known aptly as Black Mountain—every rock, indeed, pitch black.',
            'A local had mentioned a lake just a few kilometers beyond the mountain, and I decided to make the mountain my hotel for the night. I found myself a comfortable spot, stretched out, and slept peacefully beneath the stars.',
            'The next morning, refreshed, I set out cheerfully toward the lake.'
          ]
        },
        {
          title: 'A Thirsty Man\'s Mistake',
          paragraphs: [
            'As I strolled along, a group of boys on a donkey cart spotted me and offered a ride. Fantastic! No unnecessary walking for me. After they dropped me off, I continued the short walk to the lake.',
            'Water! At last! Joyfully, I scooped some into my mouth—then immediately spat it out. Nobody warned me it was salty!',
            'Damn it!',
            'It was brackish, like seawater. Well, at least I could still swim. The water felt great, despite its taste.'
          ]
        },
        {
          title: 'A Feast in the Straw Hut',
          paragraphs: [
            'Feeling refreshed after my swim, I explored the lush palm groves until I found a perfect shady spot to sit and rest. Soon, a farmer approached, inviting me to lunch. My stomach growled—I was dreaming about juicy watermelon and sweet grapes—so how could I refuse?',
            'He brought me to a straw hut covered with palm leaves, where other farmers were waiting. Their home was modest—just two blankets and a few cushions—but they radiated happiness and warmth. Their smiles were constant and genuine. The hut was surrounded by vines heavy with grapes and other ripe fruits—simple yet abundant.',
            'We settled comfortably onto the blanket and started our meal. First, they handed me some Arabic bread with cheese and onion. It was delicious.'
          ]
        },
        {
          title: 'The Language of Laughter',
          paragraphs: [
            'Over lunch, the farmers peppered me with questions. Where was I from? Where was I going? Did I have a hotel here? By now, I\'d picked up a few Egyptian words, but since none of them spoke English, we got creative—talking with our hands and feet. Somehow, we understood each other. Mostly, they found me hilarious.',
            'One of them later enthusiastically tried conversing with me in Arabic. But seeing that I truly didn\'t grasp anything he was saying, he jokingly began to shout and sing dramatically instead.',
            'We laughed until our sides hurt. Laughter filled the air—it was wonderfully cheerful there!'
          ]
        },
        {
          title: 'A Journey of Generosity',
          paragraphs: [
            'After enjoying sweet tea and some rest, I thanked them and continued onward. I hadn\'t walked far—maybe a kilometer—when another farming community appeared. All I wanted was some water, but once again, a friendly local stopped me. He asked a few questions and invited me to tea and bread. Well, why not? I certainly wasn\'t lacking food or hospitality here.'
          ]
        },
        {
          title: 'Nights in the Oasis',
          paragraphs: [
            'As dusk settled, I wandered off toward the edge of the desert again, where nobody ever went. It seemed like a perfect spot for sleep. In the middle of the night, I woke up and couldn\'t drift back off, so I decided on an impromptu night stroll through the desert.',
            'Once tiredness overtook me again, I simply stopped, lay down, and slept until sunrise.',
            'Morning offered me a magnificent view: the whole lake stretched before me, surrounded by lush greenery. I noted where water reservoirs were located, and spent that day—and the next—exploring every corner of this vast, beautiful oasis. There was water everywhere, and hunger was the least of my worries.',
            'After thoroughly exploring the oasis, I eventually headed back toward town.'
          ]
        }
      ]
    }
,
    {
      number: 7,
      title: 'Leaving Bahariya',
      theme: 'primary',
      sections: [
        {
          title: null,
          paragraphs: [
            'I spent the night wandering around town. Tiny shops buzzed with activity, and cafés overflowed with lively conversations and laughter. As usual, one of the locals noticed me and waved me over. I didn\'t refuse—I always enjoyed chatting with the townspeople.'
          ]
        },
        {
          title: 'Stranger\'s Tea, A Wanderer\'s Bed',
          paragraphs: [
            'We spoke warmly over tea about their lives, their work, and their home.',
            'After a while, another local apparently didn\'t share the same enthusiasm about my presence and chased me away. No hard feelings. You can\'t charm everyone, I guess.',
            'So, as usual, I headed back out into the desert, sleeping comfortably under the open sky. The sand made a surprisingly good bed. Sure, the night air was chilly, but never unbearably cold—only occasionally did I have to cover my face against gusts of wind. It never rained in the desert, and the ground stayed dry beneath me. Pure comfort.'
          ]
        },
        {
          title: 'A Coin for Fate, A Handshake for a Friend',
          paragraphs: [
            'In the morning, I wandered back into town. Locals had generously given me a bit of cash, so I bought something to eat and sat down, savoring the simple meal. Now it was time. I was ready to return to Cairo.',
            'But how exactly would I return to Cairo? I decided to leave it up to fate. Let the universe figure it out! Somehow, I felt sure that help would appear exactly where I\'d sat yesterday. Oddly enough, the same guy who\'d chased me off earlier was sleeping there. When he woke up and saw me, he smiled warmly, shook my hand, and we had a friendly conversation. Suddenly, we were friends. Soon afterward, he left, and I stayed there waiting patiently.'
          ]
        },
        {
          title: 'The Hands of Fate, A Prayer for the Found',
          paragraphs: [
            'As I sat there, another local man called me over. Sitting next to him was someone I\'d seen the night before. He asked if I had any problems.',
            '"I don\'t have enough money to get back to Cairo," I admitted honestly. "Actually, I don\'t have any money at all."',
            'He immediately offered to help.',
            '"Thank you!" I said gratefully.',
            '"Don\'t thank me—thank God!" he replied, pointing upwards. And he explained why:',
            '"This morning I happened to walk by and felt like having some cookies, so I bought them and sat down here. Then this man—an old friend of mine—mentioned he\'d seen you last night. I wondered if maybe you were in trouble. That\'s why I called you over to ask. You see, I\'m a minibus driver, and I know plenty of other drivers around here. Arranging a ride is no problem at all. So don\'t thank me—thank God for looking out for you!"',
            'And just like that, I understood.',
            'So I thanked God—and him, too.'
          ]
        },
        {
          title: 'The Kindness of Strangers, A Ride for the Lost',
          paragraphs: [
            'Every day, something similar happened to me. Someone would stop me, offer me food, invite me for tea, or arrange a ride. Like the car to Bahariya—I\'d managed to catch the only vehicle heading there. Each day felt miraculous, and I was deeply grateful—not only for this moment but for every single experience I\'d had. This kind Egyptian even bought me fresh water and cookies to replenish my strength, and gave me some money for food.',
            'Overwhelmed by his kindness, I struggled to find the right words, so we just continued chatting cheerfully about the oasis and life there. Three hours later, my ride was sorted, and I set off for Cairo.',
            'I got out in Giza. Now I needed to retrieve my backpack. First, I had to make my way back to 6th of October City. From there, I knew exactly where to go.',
            'My backpack in the desert... Was it still there? Had someone found it, taken it? I was about to find out...'
          ]
        }
      ]
    },
    {
      number: 8,
      title: 'Where\'s My Backpack?',
      sections: [
        {
          title: null,
          paragraphs: [
            'I got a ride, but unfortunately missed my stop. Great. Now I had no choice but to walk back. It was already evening, my feet were killing me, but somehow it didn\'t really matter. Pain I could handle, as long as I found my backpack. As I trudged along, a local man spotted me (again!) and invited me into his beautiful garden for tea. He was clearly wealthy—his villa had a swimming pool, and the garden was decorated with carpets and exotic ornaments.',
            'Despite his wealth, he wore a galabeya, just like everyone else around here. After a pleasant chat, I politely asked him to refill my water bottle, then continued my journey.',
            'By now I was completely exhausted. Eventually, I reached a busy intersection, managed to catch a minibus, and rode it to a school from which I recognized the path. It was pitch dark when I got off, and I still had several kilometers ahead of me. Stumbling along, barely able to see a meter in front of me, I navigated only by a distant antenna near where I\'d left my things.'
          ]
        },
        {
          title: 'Six Shadows in the Night',
          paragraphs: [
            'Suddenly, six large wild dogs appeared from the darkness, silently forming an escort around me. Three walked on each side. At least I had company, though they quickly realized I had no food to offer. After a while, disappointed, they quietly vanished.',
            'After hours of wandering through the night, I finally reached the antenna.',
            '"My backpack should be somewhere around here," I muttered, desperately trying to remember the exact spot…'
          ]
        },
        {
          title: 'A Treasure in the Sand',
          paragraphs: [
            'I strained my memory, trying desperately to recall the precise spot. But in the darkness, everything looked identical—an endless expanse of sand. Was I even searching in the right area? I tried one spot—nothing. Then another—still nothing. My backpack was nowhere to be seen.',
            'Had someone taken it? But who would even come out here? Was I looking in the right place at all? I could\'ve waited until morning, but what else was there to do out here? Besides, my sleeping bag was in there—sleeping would certainly be easier with it.',
            'Continuing my fruitless search, I began doubting myself. Had someone already found it? Who would even wander this way?',
            'Then, suddenly, I spotted a dark shape in the distance. I almost didn\'t dare to hope, but I walked towards it—and yes! There it was, exactly as I had left it. My backpack! Untouched, exactly as I remembered. Except, now it\'s crawling with ants. I brushed them off, pulled out my sleeping bag, and promptly fell into a deep, restful sleep.',
            'When morning came, I checked the contents of my backpack.',
            'Everything was still there:',
            '✅ Money.',
            '✅ Passport.',
            '✅ ID.',
            '✅ Plane ticket.',
            '✅ Clothes.',
            'Amazing! At least now I wouldn\'t have to worry about getting back to Slovakia. Though I somehow knew I\'d manage to return even without the plane ticket—someone surely would\'ve helped me out.',
            'Refreshed and optimistic, I continued my journey. Soon enough, I emerged near another construction site, flagged down a passing truck, and rode back to Cairo.',
            'Just like that.'
          ]
        }
      ]
    },
    {
      number: 9,
      title: 'A Trip to the Al-Fayoum Oasis',
      sections: [
        {
          title: null,
          paragraphs: [
            'A friendly old driver took me on an impromptu sightseeing tour of Cairo. Traffic in Cairo is hilarious—constant jams, horns blaring twenty-four hours a day. The drivers seem to communicate by honking, like some kind of Morse code: honk to move forward, honk to turn, honk while standing still. My driver joined right in, enthusiastically honking at every opportunity.',
            'Once we finally arrived at his destination, he unloaded his cargo, enjoyed tea and a cheerful chat with his colleagues, and then kindly drove me to the bus station. There, another helpful local quickly arranged transportation for me to Al-Fayoum, a large oasis rarely visited by tourists.',
            'I still had time to spare before my flight, so why not explore this lesser-known gem?'
          ]
        },
        {
          title: 'The Lake, the Merchants, and a Ride for Free',
          paragraphs: [
            'When I arrived, the bustling little town immediately charmed me. Merchants surrounded me eagerly, but my real goal was the lake. Minibuses circulated constantly—you simply jumped aboard and paid during the ride. Boldly, I hopped into one, and announced firmly, "No money!" To my surprise, nobody kicked me out—they just waved it off and let me stay aboard.',
            'I arrived at the lake, splashed around a bit, and wandered the shores until nightfall.'
          ]
        },
        {
          title: 'The Lawmen, Mad Lads, and a Bit of Bamboo',
          paragraphs: [
            'After sunset, I settled beneath a palm tree, wondering what to do next. Just then, a local policeman approached, asking if I had a place to sleep. When I explained I had no money and asked if I could sleep outside, he shook his head firmly. "Absolutely forbidden," he insisted. Forbidden or not—I knew I\'d figure something out.',
            'They called me over to their small guard shack, inviting me to sit and chat while they discussed my fate. Despite not understanding their Arabic conversation, I sensed a slight tension in the air as they called their supervisor for advice. Meanwhile, the officers remained friendly, offering me tea and snacks.',
            'Soon, more policemen arrived, joined by another local man. A lively debate ensued: some argued passionately that it was fine to let me sleep outside, while others weren\'t entirely convinced.',
            'Just then, a few aggressive guys turned up, rudely confronting the policemen about something I couldn\'t grasp. Bad move. The officers swiftly put them in their place—I certainly wouldn\'t have dared provoke men armed with Kalashnikovs and bamboo sticks. Nearly every policeman around here carried one casually slung over his shoulder.',
            'With those troublemakers subdued, the police softened their stance. Eventually, they agreed to let me sleep under the palm trees. One of them looked at me, sighed, and, in a softer tone, said:',
            '"Alright… you can sleep there."'
          ]
        },
        {
          title: 'From Feast at Dawn, Until Journey at Dusk',
          paragraphs: [
            'The night passed restlessly; exhaustion was catching up with me. At sunrise, I awoke to smiling policemen inviting me to breakfast, and how could I refuse? We shared delicious Arabic bread with cheese and beans, washed down with their traditional tea. A perfect breakfast.',
            'Afterward, the officers stepped out onto the road, flagged down a passing minibus, exchanged a few words with the driver, and just like that, my return journey to Cairo was arranged.'
          ]
        }
      ]
    }
,
    {
      number: 10,
      title: 'Cairo',
      theme: 'primary',
      sections: [
        {
          title: null,
          paragraphs: [
            'In the minibus back to Cairo, I realized I was running a serious fever. As soon as I arrived, I headed straight to the tourist information center to find out where the embassy was. They made a quick phone call to inform the embassy I\'d be coming, and I took a taxi over there. At the embassy, I explained that I was broke, completely exhausted, and claimed that I\'d been robbed. The ambassador clearly didn\'t believe me—but frankly, I didn\'t care. He wasn\'t particularly friendly, but his assistant was nicer.',
            'They called home so my mom could wire me some cash. Since the transfer couldn\'t happen immediately, they arranged for me to spend the night in a cheap hotel. The next morning, the money arrived without issue.',
            'Once I had cash in hand, I bought myself some melon and grapes and went straight back to bed. I slept for about twenty hours, battling fever, stomach cramps, and a pounding headache. But it was fine—I knew all I needed was rest, not medicine.',
            'When I finally woke up, I felt much better. Rested and recovered, I waited around until nightfall, got myself ready, and headed off toward the airport.'
          ]
        }
      ]
    },
    {
      number: 11,
      title: 'The Return',
      sections: [
        {
          title: null,
          paragraphs: [
            'At the airport, I bumped into the hustlers from my first day again. We started chatting. They immediately reminded me about the money they\'d lent me for the galabeya and casually mentioned I\'d left some belongings at the hotel. Fair enough. I returned the borrowed money, and in exchange, they drove me back to the hotel to retrieve my things. Along the way, I shared stories from my journey—the places I\'d seen, people I\'d met, and the adventures I\'d had. Despite everything, Egypt had been amazing.',
            'Eventually, we said goodbye, and I boarded the plane back to Bratislava.'
          ]
        }
      ]
    },
    {
      number: 12,
      title: 'Back Home',
      sections: [
        {
          title: null,
          paragraphs: [
            'At home, I rested, nursing a fever, feasting on fresh fruit, and savoring the incredible luxury of a soft bed. Excitedly, I recounted my adventures to my family, hardly pausing for breath between stories.',
            'Two days after returning, I carefully wrote down every detail of my Egyptian journey. Twelve years later, I revisited these notes and published my adventures in Slovak, primarily so that friends who hadn\'t yet heard my story could finally read it. And now, twenty years after that unforgettable trip, I\'m happily sharing it again, this time in English—just for fun.',
            'A lot has changed in these two decades. While I didn\'t finish my computer science studies, my professional path took a positive turn. In November 2004, I began working at Dell as a Technical Support Specialist. While there, I continued developing my programming skills, and in March 2006, I took a definitive step into software engineering at Accenture. Today, after eighteen fulfilling years, I\'m still enjoying my career as a Senior Software Engineer.',
            'I\'ve had countless adventures since then, but none were as wildly memorable as my journey through Egypt. In fact, I revisited Egypt again as a tourist in 2023.',
            'During that trip, we explored Cairo, Alexandria, Giza, Aswan, Abu Simbel, and Luxor. Upon arriving at Abu Simbel, however, I suddenly felt unwell—heatstroke, perhaps, or something worse? By the evening, when we arrived in Luxor, things had deteriorated, so we called a doctor to our hotel room. He appeared promptly, like some mythical healer, carrying a small metal briefcase. After asking a few quick questions, he solemnly diagnosed me with something serious—an infection.',
            '"If we don\'t start antibiotics immediately," he said, "you might only have two days left…"',
            'Treatment began at once: antibiotics through an IV. The doctors seemed puzzled by my calmness, but to lighten the mood, I started telling them funny stories about Abu Simbel and Ramses II. The doctor laughed, admitting he had never been particularly interested in Ramses II, but from now on, he\'d remember him fondly—as the Pharaoh who kept me alive.',
            'The next day, they returned with another IV, this time filled with vitamins and minerals. By lunchtime, I felt much better and couldn\'t resist finally visiting my dream destination: Karnak Temple.',
            'But enough already—I could go on and on… I love Egypt, its mysteries and history.'
          ]
        }
      ]
    }
  ]
};

