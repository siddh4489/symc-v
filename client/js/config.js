angular.module('nibs.config', [])

    //.constant('SERVER_URL', 'https://custome-nibs.herokuapp.com')
    .constant('SERVER_URL', 'https://warrenty-g-mean.herokuapp.com')

    //.constant('FB_APP_ID','176787595998073')
    .constant('FB_APP_ID','1728552984063811')
                           

    .constant('STATUS_LABELS', [
        'Forastero',
        'Trinitario',
        'Criollo'
    ])

    .constant('STATUS_DESCRIPTIONS', [
        'Forastero (For-ah-stare-oh)  is a common base to all but the finest of chocolates.  Our newest Nibs members move as fast as Forastero pods grow.',
        'Trinitario (Trin-it-air-ee-yo)  is a hybrid combining the superior taste of the criollo bean with the resilience of the forastero bean. It’s not quite as rare as Criollo, but it’s close!',
        'Criollo (Kree-oh-yo) is the most valued and rare type of cacao. Our highest level of Nibs members share the taste and sophistication of  select Crillolo pods.'
    ]);
