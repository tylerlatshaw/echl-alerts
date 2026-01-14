/**
 * @swagger
 * components:
 *   schemas:
 *     Position:
 *       type: string
 *       enum: [G, D, F]
 *
 *     Transaction:
 *       type: object
 *       required: [id, player, team, detail, date, seenAt]
 *       properties:
 *         id: { type: string }
 *         player: { type: string }
 *         team: { type: string }
 *         detail: { type: string }
 *         date: { type: string }
 *         seenAt: { type: string }
 *
 *     Subscription:
 *       type: object
 *       required: [firstName, lastName, email]
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string }
 *
 *     League:
 *       type: object
 *       required: [slug, commonName, fullName, logo, links]
 *       properties:
 *         slug:
 *           type: string
 *         commonName:
 *           type: string
 *           nullable: true
 *         fullName:
 *           type: string
 *           nullable: true
 *         logo:
 *           type: object
 *           nullable: true
 *           properties:
 *             url:
 *               type: string
 *               nullable: true
 *             colors:
 *               type: array
 *               nullable: true
 *               items:
 *                 type: string
 *         links:
 *           type: object
 *           nullable: true
 *           required: [eliteprospectsUrl, officialWebUrl, statsUrl, newsUrls]
 *           properties:
 *             eliteprospectsUrl:
 *               type: string
 *             officialWebUrl:
 *               type: string
 *             statsUrl:
 *               type: string
 *             newsUrls:
 *               type: array
 *               items:
 *                 type: string
 *
 *     Arena:
 *       type: object
 *       nullable: true
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         location:
 *           type: string
 *           nullable: true
 *         yearOfConstruction:
 *           type: integer
 *           nullable: true
 *         capacity:
 *           type: integer
 *           nullable: true
 *         infoAsHTML:
 *           type: string
 *           nullable: true
 *
 *     Team:
 *       type: object
 *       required: [id, name, slug, eliteprospectsUrlPath]
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *         eliteprospectsUrlPath: { type: string }
 *         logo:
 *           type: object
 *           nullable: true
 *           properties:
 *             small: { type: string }
 *             medium: { type: string }
 *             large:
 *               type: string
 *               nullable: true
 *             colors:
 *               type: array
 *               nullable: true
 *               items:
 *                 type: string
 *         founded:
 *           type: integer
 *           nullable: true
 *         city:
 *           type: string
 *           nullable: true
 *         country:
 *           type: object
 *           nullable: true
 *           properties:
 *             slug: { type: string }
 *             name: { type: string }
 *             iso_3166_1_alpha_2:
 *               type: string
 *               nullable: true
 *         activeSeason:
 *           type: object
 *           nullable: true
 *           properties:
 *             slug: { type: string }
 *             startYear: { type: integer }
 *             endYear: { type: integer }
 *         arena:
 *           $ref: '#/components/schemas/Arena'
 *         secondaryArena:
 *           $ref: '#/components/schemas/Arena'
 *         capHit:
 *           type: string
 *           nullable: true
 *         links:
 *           type: object
 *           nullable: true
 *           properties:
 *             officialWebUrl:
 *               type: string
 *               nullable: true
 *
 *     PlayerNationality:
 *       type: object
 *       required: [name, iso_3166_1_alpha_2]
 *       properties:
 *         name: { type: string }
 *         iso_3166_1_alpha_2: { type: string }
 *
 *     PlayerWeight:
 *       type: object
 *       required: [imperial]
 *       properties:
 *         imperial: { type: integer }
 *
 *     PlayerHeight:
 *       type: object
 *       required: [imperial]
 *       properties:
 *         imperial: { type: string }
 *
 *     NhlTeamLogo:
 *       type: object
 *       nullable: true
 *       properties:
 *         small: { type: string }
 *         medium: { type: string }
 *
 *     NhlRightsTeam:
 *       type: object
 *       required: [logo, name]
 *       properties:
 *         logo:
 *           $ref: '#/components/schemas/NhlTeamLogo'
 *         name:
 *           type: string
 *
 *     NhlRights:
 *       type: object
 *       nullable: true
 *       required: [team, rights]
 *       properties:
 *         team:
 *           $ref: '#/components/schemas/NhlRightsTeam'
 *         rights:
 *           type: string
 *           enum: [signed, unsigned]
 *
 *     Player:
 *       type: object
 *       required: [id, name, status, position, shoots, catches, dateOfBirth, age, placeOfBirth, nationality, weight, height, gameStatus, nhlRights, imageUrl, imageCopyright, eliteprospectsUrlPath]
 *       properties:
 *         id: { type: string }
 *         firstName:
 *           type: string
 *           nullable: true
 *         lastName:
 *           type: string
 *           nullable: true
 *         name: { type: string }
 *         status:
 *           type: string
 *           enum: [active, retired, deceased]
 *         position:
 *           $ref: '#/components/schemas/Position'
 *         shoots:
 *           type: string
 *           nullable: true
 *           enum: [L, R]
 *         catches:
 *           type: string
 *           nullable: true
 *           enum: [L, R]
 *         dateOfBirth:
 *           type: string
 *           nullable: true
 *         age:
 *           type: integer
 *           nullable: true
 *         placeOfBirth:
 *           type: string
 *           nullable: true
 *         nationality:
 *           $ref: '#/components/schemas/PlayerNationality'
 *         weight:
 *           $ref: '#/components/schemas/PlayerWeight'
 *         height:
 *           $ref: '#/components/schemas/PlayerHeight'
 *         gameStatus:
 *           type: string
 *           enum: [healthy, injured, suspended]
 *         nhlRights:
 *           $ref: '#/components/schemas/NhlRights'
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         imageCopyright:
 *           type: string
 *           nullable: true
 *         eliteprospectsUrlPath:
 *           type: string
 *           nullable: true
 *
 *     RosterEdge:
 *       type: object
 *       required: [player, jerseyNumber]
 *       properties:
 *         player:
 *           $ref: '#/components/schemas/Player'
 *         jerseyNumber:
 *           type: integer
 *           nullable: true
 *
 *     RosterTableData:
 *       type: object
 *       required: [edges]
 *       properties:
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RosterEdge'
 *
 *     PlayersByPosition:
 *       type: object
 *       required: [position, players]
 *       properties:
 *         position:
 *           $ref: '#/components/schemas/Position'
 *         players:
 *           type: integer
 *
 *     ImperialString:
 *       type: object
 *       required: [imperial]
 *       properties:
 *         imperial:
 *           type: string
 *
 *     FooterEdge:
 *       type: object
 *       required: [playersByPositions, averageHeight, averageWeight, averageAge]
 *       properties:
 *         playersByPositions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlayersByPosition'
 *         averageHeight:
 *           $ref: '#/components/schemas/ImperialString'
 *         averageWeight:
 *           $ref: '#/components/schemas/ImperialString'
 *         averageAge:
 *           type: string
 *
 *     FooterData:
 *       type: object
 *       required: [edges]
 *       properties:
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FooterEdge'
 *
 *     RosterResponse:
 *       type: object
 *       required: [data]
 *       properties:
 *         data:
 *           type: object
 *           required: [tableData, footerData]
 *           properties:
 *             tableData:
 *               $ref: '#/components/schemas/RosterTableData'
 *             footerData:
 *               $ref: '#/components/schemas/FooterData'
 *
 *     LeagueData:
 *       type: object
 *       required: [data]
 *       properties:
 *         data:
 *           type: object
 *           required: [league, teams]
 *           properties:
 *             league:
 *               $ref: '#/components/schemas/League'
 *             teams:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *
 *     LeagueResponse:
 *       type: object
 *       required: [data]
 *       properties:
 *         data:
 *           type: object
 *           required: [leagueRosters]
 *           properties:
 *             leagueRosters:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [league, teams]
 *                 properties:
 *                   league:
 *                     $ref: '#/components/schemas/League'
 *                   teams:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Team'
 */