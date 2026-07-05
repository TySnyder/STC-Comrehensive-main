// The Solutions Method® 17 Therapeutic Life Themes.
// Cycle order confirmed by owner 2026-07-03 (differs slightly from the source
// docx ordering: Self Destruction & Escape precedes Health & Wellness).
// Source: "Master The Solutions Method® Theme Descriptions 02_12_26.docx".

export interface ThemeInfo {
  name: string;
  description: string;
  /** Clinical techniques used during the theme week (list text from the master doc). */
  techniques: string;
}

export const THEME_CYCLE_LENGTH = 17;

export const THEMES: ThemeInfo[] = [
  {
    name: 'Personal Goals',
    description:
      "As someone enters treatment at Solutions, it's important for them to explore their own personal goals for recovery. With the Solutions Method®, clients are encouraged to look at various aspects of their lives and identify short term and long term goals they want to achieve during the treatment process. Goals in the areas of relationships, sobriety, emotional health, career, health and wellness, work and finance are just a few examples. Ultimately the goal is to support clients in increasing their overall life satisfaction. During treatment at Solutions, clients will experience success in accomplishing small goals along the way in preparation for continued success after discharge.",
    techniques:
      'Looking at our cognitive processing around the concept or goals, the messages we tell ourselves about our ability to achieve or not achieve our goals, vision boards, guided imagery, solution-focused techniques, step-by-step maps for success, practice setting small achievable goals to boost confidence, time management strategies and acknowledgment of barriers met with creative ways to work around them and SMART Goal strategies for success.',
  },
  {
    name: 'Identity',
    description:
      'Many clients come to Solutions without a deep understanding of who they are and who they want to be. Our sense of self is largely defined in our younger years and highly influenced by our childhood experiences with our families, schoolmates, teachers and the world around us. Perhaps we had messages instilled upon us telling us who and what we are. When children experience traumas or losses, oftentimes they are left feeling responsible even when this is the furthest thing from the truth. Positive experiences and feedback boost our self-esteem and confidence. As we grow, our life experiences continue to reinforce those beliefs about who we are and how we fit in the world. When life events are significant enough, it can rock our sense of self and leave us searching once again to identify who we are. What are my values and beliefs? Am I a good person? Am I worthy? Do I deserve to be happy? These are some of the questions our clients come to us asking. At Solutions, we find it crucial in a client’s long-term healing to begin examining their inner world. Clients are encouraged to think about their wants, needs, desires, hopes, dreams, fears, and who they are in different relational contexts, especially in context to themselves. Our goal is to help clients identify who they are at their core and develop a positive relationship with oneself.',
    techniques:
      "DBT, Motivational Interviewing, Object Relations groups, talk therapy, The Johari's Window, mask work, psychodrama, and art therapy techniques such as inside-out work, processing childhood photographs and autobiographies, and role playing.",
  },
  {
    name: 'Family of Origin',
    description:
      'The families we grew up with are typically the most influential in the development of our personal belief systems, personalities, decision-making skills, and behavioral traits. Our families of origin are likely the ones we love the most yet also have the power to cause the most pain. Regardless of how functional, loving, chaotic, or dysfunctional our families are, they are the ones we learn how to relate to others from. As children, we do not have the awareness of how influential the family dynamic is and have little or no control over them. As adults we have an opportunity to reflect on these experiences and heal past hurts, traumas, resentments as well as learning to appreciate the gifts and lessons our families provided to us. It is not uncommon to have conflicting emotions and memories of how we grew up. The reality is you can love and hate the same person at the same time. Challenging one’s core beliefs and accepting that things are the way they are is crucial in recovery. By doing this, clients learn to release the unconscious grip our childhood beliefs have on us and make healthy, conscious life choices going forward. Our goal is to help clients identify family issues and heal past hurts, resentments, and emotional traumas which sets the stage for deeper healing throughout the Solutions program.',
    techniques:
      'CBT and exploring our thoughts, beliefs about family and the behaviors we learned growing up, family trees, genograms, individual and multi-family therapy, empty chair work, identifying family roles, psycho-drama, differentiating between our family of origin and our families of choice, and timelines.',
  },
  {
    name: 'Inner Child',
    description:
      'When we go through emotionally charged events as children our experience of those events is influenced by our chronological age at the time. When a child encounters a traumatic event, they do not yet have the affect tolerance or developmental skills that an adult would have and they interpret those events based on the developmental stage they were at. Many children blame themselves for traumatic events such as divorce, death of a parent, and natural disasters, and they internalize negative messages about themselves as a result. At Solutions, we believe it is imperative to re-examine the event and the beliefs that were formed at the time from an adult perspective. Oftentimes, learning to re-parent or reassure that inner child that they were not responsible for that event is essential in healing. Adults who have experienced this kind of loss have also lost a sense of innocence, wonder, and play, and we work to help our clients get back in touch with that sense of wonderment.',
    techniques:
      'Psychoeducation, re-parenting, learning self-nurturance skills, timelines, teaching around self-love and self-forgiveness, guided imagery, cognitive behavioral therapy, art therapy, reparenting skills, and play therapy.',
  },
  {
    name: 'Self Destruction & Escape',
    description:
      'Over time we develop unhealthy and destructive ways to escape (also known as self-medicating) our unpleasant emotions. Substance abuse, addiction, eating disorders, and gambling are some common coping mechanisms, however more subtle behaviors can also have a strong effect on our ability to feel content and satisfied with our lives. During this week we find it invaluable for clients to explore some of the less obvious ways they engage in self destructive behaviors including relationship patterns, self-sabotage, sexual acting out, pornography use, unhealthy eating habits, lack of self-care, overspending, codependency, lack of exercise, surrounding ourselves with or creating drama and chaos, and escaping with movies, TV, and video games. Clients are then guided to identify and practice healthier ways to cope with difficult emotions.',
    techniques:
      'The creation or review of relapse prevention and safety plans, solution focused therapy, 12-step meeting attendance, mindfulness-based relapse prevention, cognitive behavioral therapy, motivational interviewing techniques, and identifying motivation levels to work on each of our escape mechanisms. Motivational Interviewing techniques include identifying stages of change and therapeutic journaling to track these behaviors and choosing to abstain from these behaviors.',
  },
  {
    name: 'Health & Wellness',
    description:
      "Oftentimes, our own self-care takes a back seat to life's responsibilities, expectations, and the care taking of others. It's easy to lose sight of our own issues or concerns around health and wellness and the importance of addressing them. The Solutions Method® presents clients with information on the benefits of nutrition, exercise, and meditation, and they are encouraged to identify what supports them and what constitutes self-care. They explore small ways they can bring joy into their lives on a daily basis. Clients are supported to add healthy habits into their daily routine including walking, making art, meditation, exercise, nutrition, staying hydrated, eating healthy, and listening to music.",
    techniques:
      'Psychoeducation on nutrition and healthy eating, CBT techniques and developing SMART goals to achieve better overall health, Motivational Interviewing to identify blocks, guided imagery experientials, health and wellness assessments, meditation walks, mindful eating practice, and guest lectures from healing and medical professionals.',
  },
  {
    name: 'Relationships',
    description:
      'During this week clients are provided with the opportunity to explore important relationships in their lives and the influences these relationships have on their wellbeing. The relationships they examine may be with family, people from a distance, at work, friends, online and social media relationships with loved ones, and even their pets, however, the most important relationship our clients delve into is the relationship they have with themselves and the world around them. Clients often are not aware of how demanding, demeaning, or important certain relationships are. This week clients are encouraged to look at their relationships to self and others, discover ways they can improve them, and, in some cases, identify those they may need to terminate.',
    techniques:
      'CBT techniques such as acceptance and change and assertiveness training, Motivational Interviewing worksheets like "Building Discrepancy," timelines, psychoeducation on the various types of relationships, art therapy to visually depict healthy and unhealthy relationship dynamics, psycho-drama establishing healthy relationships, dyad work, empty chair experientials, role play, learning about healthy relationship styles and the impact negative relationships have had on themselves, and couples and relationship counseling.',
  },
  {
    name: 'Boundaries',
    description:
      'Boundaries can be physical or emotional and can greatly impact our sense of self. When we have unhealthy boundaries, we may be easily hurt, influenced, manipulated, or controlled by others. When boundaries are too rigid, we can lose out on emotional connection and enjoyment in life. The overriding goal of this theme is to work with clients to develop skills in setting healthy boundaries with others regarding how they wish to be treated and to explore parameters around personal space and safety. This tends to be a big step in the journey toward wellness as many clients find they have had little exposure to healthy boundaries.',
    techniques:
      'Psycho-education, teaching the different types of boundaries, exploring our thought process around various boundaries, identifying feelings around asserting or not asserting a boundary, decisional balance worksheets, Motivational Interviewing, role playing, cognitive behavioral therapy worksheets, therapeutic journaling, art therapy to create a physical representation of healthy and unhealthy boundaries, sand tray, practice boundary setting in group and family therapy, and experiential therapies.',
  },
  {
    name: 'Communication Skills',
    description:
      'How we communicate with others says a lot about ourselves. Some messages convey what we want to say while sometimes we are unconscious of our communication styles and how they may be interpreted. We may not say what we mean to say or think we said something we did not. Nonverbal communications may convey unwarranted messages that we don’t intend such as disinterest, threats, or anger. At Solutions, we look at ways that we communicate verbally and nonverbally. Clients are given the opportunity to practice more direct and less confusing styles of communication such as using "I" statements, role playing, and identifying ways their body postures and movements are expressing their message.',
    techniques:
      'CBT exercises and understanding how our thinking emphasizes our behaviors around communication, Motivational Interviewing, empty chair work, role playing, mirroring, psychodrama, solution-focused exercises, practicing various communication styles, and practicing how to react when we are told no. Through group therapy, family therapy, and working in dyads, clients are able to give and receive feedback regarding communication styles and practice ways to be clearer that they want to convey.',
  },
  {
    name: 'Shadow Self',
    description:
      'The shadow self is defined as those parts or aspects of ourselves that we try to hide from ourselves and others. Oftentimes, denying these aspects can lead to their strengthening and the subconscious expression of the "negative" traits that we are trying so hard to deny. The shadow self theme may be one of the most intense yet important themes that the Solutions Method® has to offer. Only by acknowledging and accepting these sides of ourselves can we decrease their hold on us. Once acknowledged, we can then make the conscious choice to change these aspects going forward.',
    techniques:
      "CBT and identifying how our beliefs have and do influence our shadow self, The Johari's Window, mindfulness meditations, Jungian archetype work, role playing, psychodrama, dyad work around projections, art therapy including mask making, and Window of Tolerance work.",
  },
  {
    name: 'Work & Finance',
    description:
      'Another aspect of our lives where the influence is underestimated is our work lives and our financial beliefs and patterns. As part of the Solutions Method®, clients are offered the opportunity to explore how their work lives, careers, education, and financial beliefs and patterns, impact their stress levels and affect their daily lives. Clients are also encouraged to examine family behaviors and beliefs about money and wealth or lack thereof has impacted them as adults. They identify ways in which healthy changes may need to be implemented. Even our work choices can reflect our inner struggle and can be unhealthy and sometimes a career change is in order. Our younger clients can explore their educational experiences and choices as well as their career goals.',
    techniques:
      'Psycho-education, budgeting strategies, CBT, Motivational Interviewing, experiential therapy, timelines, addiction self-destruction, emotional and monetary cost analysis, creating a financial biography, solution focused strategies for stress reduction and money management, identifying emotional triggers within our work environment, and taking inventory of our work history while creating a cost benefit analysis.',
  },
  {
    name: 'Grief & Loss',
    description:
      'During grief and loss week at Solutions, clients explore ways in which they have experienced grief and loss issues in their lives. While loss due to death is one of the most common and universally and socially accepted, it is just as important to acknowledge and honor other losses that we may have endured such as loss of innocence, childhood, futures we had envisioned, loss of our addiction, relationships, and a sense of meaning and purpose as evidenced by empty-nest syndrome, retirement, and the like. Clients are given an opportunity to grieve and honor such losses in a safe and nurturing space.',
    techniques:
      'CBT, Motivational Interviewing around letting go, process therapy groups, psychoeducation on stages of grief, letting go ceremonies, letter writing, bibliotherapy, experiential therapy and art therapy, identifying healthy ways to fill the hole that grief has left, and self forgiveness.',
  },
  {
    name: 'Life Changes & Transitions',
    description:
      'Life is continuously changing and evolving and is full of transitions. We have a tendency to downplay the impact that common life transitions like moves, divorce, children going away to college, getting married, and retirement have on our emotional health and well-being. Even if it is a common experience, that does not diminish its effects on us. It is important to take note of such transitions and acknowledge the significance they have in our lives. When certain events are common, we have a tendency to underestimate the power that these events can have on us and our need to grieve or process that impact. The Solutions Method® helps clients honor and integrate the life changes they experience and assists them in identifying the changes and directions they want to go in while putting them back in the driver’s seat and in control of their lives.',
    techniques:
      'Life transition timelines, guided imagery and meditation, ceremony, group psychotherapy and process groups, family therapy, art therapy, body centered psychotherapy and experiential work, cognitive behavioral therapy, motivational interviewing techniques, solutions focused techniques, and goal setting.',
  },
  {
    name: 'Mind/Body Connection',
    description:
      'Stress, time constraints, pressures, and responsibilities often lead us to live life on autopilot. We forget to stop, notice the life around us, pay attention to what our bodies are telling us, and be aware of our needs and sensations. It is important to understand where in our body we hold our emotions. We are oftentimes unaware of how stress impacts our body and emotional health. During this week, clients are asked to reconnect with their bodies, get out of their heads, and notice that they can ground and be present in the moment.',
    techniques:
      'Mindfulness based meditation and practices, breathing techniques, body centered psychotherapy, guest lectures, stress management techniques, CBT strategies that help teach clients to pause and create space to be aware of their thoughts and sensations and how thoughts and feelings are connected.',
  },
  {
    name: 'Forgiveness & Amends',
    description:
      'Forgiveness and amends may be one of the most difficult topics clients are asked to work through during their time at Solutions. Clients explore the people, places, things, and events for which they have been holding resentments. They are encouraged to look honestly at the pros and cons of holding such resentments and to consider the possibility of letting go. It takes more energy to hold onto resentments and blame than it does to acknowledge the pain it has caused and move forward. Clients are also encouraged to look at ways they have hurt themselves and others and to make amends for the pain they have caused in relationships with others and most importantly with themselves when possible.',
    techniques:
      'Letter writing, CBT, Motivational Interviewing, Gestalt work, volunteer activities, role playing and dyad work, art therapy and psychotherapy process groups, psychodrama, cognitive behavioral therapy, and mindfulness based practices. Videos and readings on forgiveness may be used. Clients may also be encouraged to explore the role of spirituality and how it may serve as a source of support.',
  },
  {
    name: 'Transformation & Acceptance',
    description:
      "It's the goal for each and every one of our clients to leave Solutions feeling as if their lives have improved. This occurs by learning to accept and acknowledge all aspects of themselves–the good, the bad and the ugly–and realize it's the combination of their experiences, thoughts, histories, gifts, imperfections, talents, and decisions that make up the amazing people they are today. Clients are encouraged to reflect on their experience with the program and to acknowledge the areas of life they have experienced some type of transformation in.",
    techniques:
      'Journaling, timelines, psychotherapy process groups, meditation, art therapy, guided imagery, reflection on how they felt in the beginning compared to now, cognitive behavioral therapy, Motivational Interviewing and stage of change evaluation, recreational therapy, and through art or movement therapy the creation of some type of physical representation of the changes they have experienced.',
  },
  {
    name: 'Meaning & Purpose',
    description:
      'A core tenet of the Solutions Method® for treatment is the importance of the value that one feels when they are a contributing member of society. When our clients experience themselves as making a positive impact on others and the world around them it is a palatable shift. During this week, clients identify their core strengths, gifts and unique abilities in which they feel can contribute to others and the world at large. Clients are encouraged to move forward and put these contributions into action through volunteer work, mentorship, teaching, and service programs. Contentment in who we are comes from our sense that we matter to others and the world around us.',
    techniques:
      'Volunteer work as a group, identifying ways to share our gifts with one another and putting them into daily practice, random acts of kindness, process therapy, experiential therapy, guided imagery and guided meditation, cognitive behavioral therapy and most importantly, the group therapy dynamic is critical in learning to see ourselves as others see us. Motivational Interviewing — clients at this point may be in the action and maintenance stages of change.',
  },
];
