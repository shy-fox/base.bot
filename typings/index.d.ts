declare enum ErrorCodes {
    warning = 0,
    standard = 1,
    problem = 2,
    severe = 3,
    fault = 4
}

declare enum AILevel {
    easy = 0,
    normal = 1,
    hard = 2
}

declare enum Orientation {
    vertical = "v",
    horizontal = "h"
}

declare type ValidPrefix = "!"|"-"|";"|"$"|"/"|"."|","|"="|"+"|"?"|">"|"*";

declare type ValidCommand = "help"|"p"|"play"|"s"|"skip"|"info";

declare type PlayerType = {
    username: string,
    id: string,
    tag: string,
    level: number,
    wins: number,
    losses: number,
    difficulty?: AILevel
};

declare module 'bot.base' {
   
    import * as Discord from 'discord.js'

    export const version: string;

    //#region CLASSES

    class Player {
        public player: PlayerType;

        constructor(player: Discord.User|Discord.Client);
    }

    export class AI extends Player {
        public player: PlayerType;
        public difficulty: AILevel;

        constructor(bot: Discord.Client, difficulty: AILevel);

        public changeDifficulty(newDifficulty: AILevel): Promise<this>;
    }

    export class UserPlayer extends Player {
        public player: PlayerType;

        constructor(user: Discord.User);
    }

    export class Base<T extends keyof ObjectType> {
        public readonly id: string;
        public readonly sub: ObjectType[T];

        constructor(sub: ObjectType[T]);
    }

    export class BaseGame extends Base<"game"> {
        public readonly id: string;
        public score: number;
        public players: number;
        public board?: any[][];
        public difficulty: AILevel;
        public level?: number;

        public init(): this;
        public onWin(): void;
        public onLose(): void;
        public displayScore(): void;
        public round(): this;
    }

    export class BaseHandler extends Base<"handler"> {
        public readonly id: string;

        constructor();

        public createHandler<H extends keyof HandlerType>(handler: H): HandlerType[H];
    }

    export class BaseError extends Base<"error"> {
        public readonly id: string;
        public readonly code: ErrorCodes;
        public readonly name: string;
        public readonly message: string;
        public readonly stack?: string;

        constructor(name: keyof ErrorType, message: string, stack?: string);

        public throw():void;
    }

    export class BaseManager extends Base<"manager"> {
        public readonly id: string;
        public readonly priority: number;

        constructor();
    }

    export class ErrorHandler extends BaseHandler {
        constructor();

        public createInstance(): this;
        public printStackTrace(err: Error): void;
        public createError(name: string, message: string, stack?: string): Error;
        public except(fun: (...args: any) => any | Function, ...errors: Error[]): void;
    }

    export class MessageHandler extends BaseHandler {
        readonly msg: string;
        
        constructor(msg: string);

        public reply(to: Discord.User): void;
        public sendDM(to: Discord.User|Discord.Collection<Discord.Role, Discord.GuildMember>): void;
        public deleteMessage(msg: Discord.Message, reason?: string):void;
        public deleteMessagesContaining(str: string, msg: Discord.Message[], reason?: string): void
    }

    export class ResponseHandler extends BaseHandler {
        readonly response: string;

        constructor(response: string);

        public executeWithResponse(fun: Function): this;
        public respondError(err: Error): this;
    }

    export class CommandHandler extends BaseHandler {
        readonly prefix: ValidPrefix;

        public execute(command: string|ValidCommand): void;
        public executeOnError(command: string|ValidCommand, on: Error): void;
    }

    export class MessageError extends BaseError {
        constructor(message: string);
    }

    export class UserError extends BaseError {
        constructor(message: string);
    }

    export class RuntimeError extends BaseError {
        constructor(message: string);
    }

    export class MathError extends BaseError {
        constructor(message: string);
    }

    export class CommandManager extends BaseManager {
        constructor();

        public execute(command: string|ValidCommand): Promise<this>|PromiseLike<this>;
        public check(command: string|ValidCommand, prefix:ValidPrefix): boolean;
    }

    export class GameManager extends BaseManager {
        constructor();

        public play(game: BaseGame): void;
        public start(): this;
    }

    export class ThreeGame extends BaseGame {
        public board: number[][];
        public nRound: number;
        readonly maxRounds: number;

        public nextRound(): this;
        public move(player: Player): void;
    }

    export class BattleshipsGame extends BaseGame {
        public board: boolean[][];
        
        public set(ship: BattleshipsGameObject, orientation: Orientation): this;
        public hit(x: number, y: number): boolean;
        
        private check(ship: BattleshipsGameObject): boolean;
        private checkHit(x: number, y: number): boolean;
    }

    //#endregion CLASSES

    //#region INTERFACES

    interface ObjectType {
        manager: BaseManager,
        handler: BaseHandler,
        error: BaseError,
        game: BaseGame
    }

    interface HandlerType {
        message: MessageHandler,
        error: ErrorHandler,
        response: ResponseHandler,
        command: CommandHandler
    }

    interface ErrorType {
        message: MessageError,
        user: UserError,
        runtime: RuntimeError,
        math: MathError
    }

    interface ManagerType {
        command: any,
        game: any,
        activity: any
    }

    interface Game {
        three: ThreeGame,
        battleships: BattleshipsGame
    }

    interface BattleshipsGameObject {
        command: [true, true],
        submarine: [true, true, true],
        cruiser: [true, true, true],
        battleship: [true, true, true, true],
        carrier: [true, true, true, true]
    }

    //#endregion INTERFACES
}