namespace jest {
    interface Expect {
        sameObject(expected: object): any;
    }
    interface InverseAsymmetricMatchers {
        sameObject(expected: object): any;
    }
}
